import type {
  ConversaRepository,
  FiltroConversas,
  PaginaConversas,
} from "@/core/application/ports/ConversaRepository";
import type { Queryable } from "@/core/application/ports/Queryable";
import type { Conversa } from "@/core/domain/Conversa";
import { paraDominio, type ConversaRow } from "@/infra/db/mappers/conversaMapper";

const COLUNAS = `id, sistema_id, bot, contato_nome, contato_telefone, status, estado, prioridade,
  iniciada_em, ultima_mensagem_em, assumida_em`;

const COLUNAS_COM_TRECHO = `c.id, c.sistema_id, c.bot, c.contato_nome, c.contato_telefone, c.status, c.estado,
  c.prioridade, c.iniciada_em, c.ultima_mensagem_em, c.assumida_em,
  LEFT(ultima_msg.conteudo, 140) AS ultima_mensagem_trecho`;

/** Rank usado para ordenar "prioridade DESC": crítica antes de normal (não é ordem alfabética). */
const RANK_PRIORIDADE = `(CASE WHEN c.prioridade = 'critica' THEN 1 ELSE 0 END)`;

interface Cursor {
  rank: number;
  ultimaMensagemEm: string;
  id: number;
}

function codificarCursor(row: ConversaRow): string {
  const cursor: Cursor = {
    rank: row.prioridade === "critica" ? 1 : 0,
    ultimaMensagemEm: (row.ultima_mensagem_em ?? new Date(0)).toISOString(),
    id: row.id,
  };
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodificarCursor(cursor: string): Cursor {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Cursor;
}

export class PgConversaRepository implements ConversaRepository {
  constructor(private readonly db: Queryable) {}

  async buscarPorId(id: number): Promise<Conversa | null> {
    const { rows } = await this.db.query<ConversaRow>(
      `SELECT ${COLUNAS} FROM felipe_system.conversas WHERE id = $1`,
      [id],
    );
    return rows[0] ? paraDominio(rows[0]) : null;
  }

  async buscarPorIdParaAtualizacao(id: number): Promise<Conversa | null> {
    const { rows } = await this.db.query<ConversaRow>(
      `SELECT ${COLUNAS} FROM felipe_system.conversas WHERE id = $1 FOR UPDATE`,
      [id],
    );
    return rows[0] ? paraDominio(rows[0]) : null;
  }

  async listarPorProjeto(filtro: FiltroConversas): Promise<PaginaConversas> {
    const params: unknown[] = [filtro.sistemaId];
    const condicoes: string[] = ["c.sistema_id = $1"];

    if (filtro.status) {
      params.push(filtro.status);
      condicoes.push(`c.status = $${params.length}`);
    }

    if (filtro.busca?.trim()) {
      params.push(`%${filtro.busca.trim()}%`);
      const idx = params.length;
      condicoes.push(`(c.contato_nome ILIKE $${idx} OR c.contato_telefone ILIKE $${idx})`);
    }

    if (filtro.cursor) {
      const cursor = decodificarCursor(filtro.cursor);
      params.push(cursor.rank, cursor.ultimaMensagemEm, cursor.id);
      const [rIdx, tIdx, iIdx] = [params.length - 2, params.length - 1, params.length];
      condicoes.push(
        `(${RANK_PRIORIDADE}, c.ultima_mensagem_em, c.id) < ($${rIdx}::int, $${tIdx}::timestamptz, $${iIdx}::int)`,
      );
    }

    params.push(filtro.limite + 1);
    const limiteIdx = params.length;

    const { rows } = await this.db.query<ConversaRow>(
      `SELECT ${COLUNAS_COM_TRECHO} FROM felipe_system.conversas c
       LEFT JOIN LATERAL (
         SELECT conteudo FROM felipe_system.mensagens m
         WHERE m.conversa_id = c.id
         ORDER BY m.criada_em DESC
         LIMIT 1
       ) ultima_msg ON TRUE
       WHERE ${condicoes.join(" AND ")}
       ORDER BY ${RANK_PRIORIDADE} DESC, c.ultima_mensagem_em DESC, c.id DESC
       LIMIT $${limiteIdx}`,
      params,
    );

    const temMais = rows.length > filtro.limite;
    const pagina = temMais ? rows.slice(0, filtro.limite) : rows;
    const proximoCursor = temMais ? codificarCursor(pagina[pagina.length - 1]!) : null;

    return { itens: pagina.map(paraDominio), proximoCursor };
  }

  async contarPorStatus(sistemaId: number): Promise<Record<string, number>> {
    const { rows } = await this.db.query<{ status: string; total: string }>(
      `SELECT status, COUNT(*)::text AS total FROM felipe_system.conversas
       WHERE sistema_id = $1 GROUP BY status`,
      [sistemaId],
    );
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.total)]));
  }

  async salvar(conversa: Conversa): Promise<void> {
    const props = conversa.toProps();
    await this.db.query(
      `UPDATE felipe_system.conversas SET status = $2, assumida_em = $3 WHERE id = $1`,
      [props.id, props.status, props.assumidaEm],
    );
  }
}
