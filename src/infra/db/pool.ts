import { Pool, types } from "pg";
import { env } from "@/infra/config/env";

/**
 * conversas.id, mensagens.id e eventos.id são BIGINT — o driver `pg` devolve BIGINT (OID 20)
 * como string por padrão (podem estourar Number.MAX_SAFE_INTEGER). Nesse domínio os IDs nunca
 * chegam perto disso, então convertemos para number aqui; senão toda comparação de id no app
 * quebra silenciosamente (string "48" !== number 48).
 */
types.setTypeParser(20, (value: string) => Number.parseInt(value, 10));

declare global {
  var __pgPool: Pool | undefined;
}

/**
 * Reaproveita o pool entre hot-reloads do Next.js em dev (senão cada reload abre um novo
 * conjunto de conexões e o Postgres acaba recusando por excesso de clientes).
 */
export const pool: Pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
  });

if (env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}
