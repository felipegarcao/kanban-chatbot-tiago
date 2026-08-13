import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

for (const arquivo of [".env.local", ".env"]) {
  if (existsSync(arquivo)) {
    process.loadEnvFile(arquivo);
    break;
  }
}

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "..", "migrations");

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida. Configure .env.local antes de rodar as migrations.");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS felipe_system.schema_migrations (
        nome_arquivo TEXT PRIMARY KEY,
        aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: aplicadas } = await pool.query<{ nome_arquivo: string }>(
      "SELECT nome_arquivo FROM felipe_system.schema_migrations",
    );
    const jaAplicadas = new Set(aplicadas.map((r) => r.nome_arquivo));

    const arquivos = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const arquivo of arquivos) {
      if (jaAplicadas.has(arquivo)) {
        console.log(`- ${arquivo} (já aplicada)`);
        continue;
      }

      const sql = readFileSync(path.join(MIGRATIONS_DIR, arquivo), "utf8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO felipe_system.schema_migrations (nome_arquivo) VALUES ($1)", [arquivo]);
        await client.query("COMMIT");
        console.log(`✓ ${arquivo}`);
      } catch (erro) {
        await client.query("ROLLBACK");
        throw new Error(`Falha ao aplicar ${arquivo}: ${erro instanceof Error ? erro.message : erro}`);
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
