import { existsSync } from "node:fs";
import process from "node:process";
import * as argon2 from "argon2";
import { Pool } from "pg";
import type { StatusConversa } from "../src/core/domain/Conversa";

for (const arquivo of [".env.local", ".env"]) {
  if (existsSync(arquivo)) {
    process.loadEnvFile(arquivo);
    break;
  }
}

if (process.env.NODE_ENV === "production") {
  console.error("Seed de desenvolvimento não roda em produção (NODE_ENV=production). Abortando.");
  process.exit(1);
}

const STATUS: StatusConversa[] = [
  "ativa",
  "aguardando_humano",
  "aguardando_financeiro",
  "em_atendimento",
  "aguardando_cliente",
  "resolvida",
];

const NOMES = [
  "Ana Souza", "Bruno Lima", "Carla Dias", "Diego Alves", "Elaine Costa",
  "Fábio Nunes", "Gabriela Reis", "Hugo Martins", "Isabela Rocha", "João Pereira",
  "Karina Melo", "Lucas Freitas", "Mariana Teixeira", "Nelson Barros", "Olivia Cardoso",
];

const ESTADOS = ["abertura", "coletando", "pronto_oferta", "ofertado", "link_enviado", "aguardando_forms", "finalizado"] as const;

function telefoneFake(i: number): string {
  return `55189${String(90000000 + i).padStart(8, "0")}@s.whatsapp.net`;
}

function amostra<T>(lista: readonly T[]): T {
  return lista[Math.floor(Math.random() * lista.length)]!;
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida. Configure .env.local antes de rodar o seed.");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const senhaHash = await argon2.hash("senha123", { type: argon2.argon2id });

    const { rows: sistemas } = await pool.query<{ id: number }>(
      `INSERT INTO felipe_system.sistemas (nome, descricao, ativo)
       VALUES ('Vendas', 'Bot de vendas via WhatsApp', TRUE), ('Suporte', 'Bot de suporte ao cliente', TRUE)
       ON CONFLICT DO NOTHING
       RETURNING id`,
    );

    let sistemaIds = sistemas.map((s) => s.id);
    if (sistemaIds.length === 0) {
      const { rows } = await pool.query<{ id: number }>(
        `SELECT id FROM felipe_system.sistemas WHERE nome IN ('Vendas', 'Suporte') ORDER BY id`,
      );
      sistemaIds = rows.map((r) => r.id);
    }

    for (const sistemaId of sistemaIds) {
      const { rows: existentes } = await pool.query<{ id: number }>(
        `SELECT id FROM felipe_system.sistema_colunas WHERE sistema_id = $1 LIMIT 1`,
        [sistemaId],
      );
      if (existentes.length === 0) {
        await pool.query(
          `INSERT INTO felipe_system.sistema_colunas (sistema_id, chave, titulo, cor, ordem, visivel)
           VALUES
             ($1, 'ativa', 'Ativa', '#6366f1', 0, TRUE),
             ($1, 'aguardando_humano', 'Aguardando humano', '#f59e0b', 1, TRUE),
             ($1, 'em_atendimento', 'Em atendimento', '#0ea5e9', 2, TRUE),
             ($1, 'aguardando_cliente', 'Aguardando cliente', '#a855f7', 3, TRUE),
             ($1, 'aguardando_financeiro', 'Aguardando financeiro', '#22c55e', 4, TRUE),
             ($1, 'resolvida', 'Resolvida', '#64748b', 5, TRUE)`,
          [sistemaId],
        );
      }
    }

    const { rows: admin } = await pool.query<{ id: number }>(
      `INSERT INTO felipe_system.usuarios (nome, email, senha_hash, papel, ativo)
       VALUES ('Admin Dev', 'admin@dev.local', $1, 'admin', TRUE)
       ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING id`,
      [senhaHash],
    );
    const { rows: operador } = await pool.query<{ id: number }>(
      `INSERT INTO felipe_system.usuarios (nome, email, senha_hash, papel, ativo)
       VALUES ('Operador Dev', 'operador@dev.local', $1, 'operador', TRUE)
       ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING id`,
      [senhaHash],
    );

    for (const sistemaId of sistemaIds) {
      await pool.query(
        `INSERT INTO felipe_system.usuario_sistemas (usuario_id, sistema_id) VALUES ($1, $2), ($3, $2)
         ON CONFLICT DO NOTHING`,
        [admin[0]!.id, sistemaId, operador[0]!.id],
      );
    }

    let contador = 0;
    for (const sistemaId of sistemaIds) {
      for (let i = 0; i < 15; i++) {
        contador += 1;
        const status = STATUS[contador % STATUS.length]!;
        const estado = status === "aguardando_financeiro" ? "finalizado" : amostra(ESTADOS);
        const prioridade = Math.random() < 0.15 ? "critica" : "normal";
        const nome = amostra(NOMES);
        const horasAtras = Math.floor(Math.random() * 72);

        const { rows: conversaRows } = await pool.query<{ id: number }>(
          `INSERT INTO felipe_system.conversas
             (sistema_id, bot, contato_nome, contato_telefone, status, estado, prioridade, iniciada_em, ultima_mensagem_em, assumida_em)
           VALUES ($1, 'tiago', $2, $3, $4, $5, $6, NOW() - ($7 || ' hours')::interval - interval '10 minutes',
             NOW() - ($7 || ' hours')::interval, ${status === "em_atendimento" || status === "aguardando_cliente" ? "NOW()" : "NULL"})
           RETURNING id`,
          [sistemaId, nome, telefoneFake(contador), status, estado, prioridade, horasAtras],
        );
        const conversaId = conversaRows[0]!.id;

        await pool.query(
          `INSERT INTO felipe_system.mensagens (conversa_id, autor, conteudo, criado_em) VALUES
             ($1, 'contato', 'Oi, gostaria de mais informações', NOW() - ($2 || ' hours')::interval - interval '9 minutes'),
             ($1, 'bot', 'Claro! Posso te ajudar com isso.', NOW() - ($2 || ' hours')::interval)`,
          [conversaId, horasAtras],
        );
      }
    }

    console.log(`Seed concluído: ${sistemaIds.length} sistemas, 2 usuários, ${contador} conversas.`);
    console.log("Login admin: admin@dev.local / senha123");
    console.log("Login operador: operador@dev.local / senha123");
  } finally {
    await pool.end();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
