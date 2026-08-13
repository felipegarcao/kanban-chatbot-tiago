import type { Pool } from "pg";
import type { TransacaoContexto, UnitOfWork } from "@/core/application/ports/UnitOfWork";
import { PgConversaRepository } from "@/infra/db/repositories/PgConversaRepository";
import { PgEventoRepository } from "@/infra/db/repositories/PgEventoRepository";

export class PgUnitOfWork implements UnitOfWork {
  constructor(private readonly pool: Pool) {}

  async executar<T>(fn: (ctx: TransacaoContexto) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const ctx: TransacaoContexto = {
        conversas: new PgConversaRepository(client),
        eventos: new PgEventoRepository(client),
      };
      const resultado = await fn(ctx);
      await client.query("COMMIT");
      return resultado;
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  }
}
