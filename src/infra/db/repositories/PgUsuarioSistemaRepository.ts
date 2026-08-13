import type { Queryable } from "@/core/application/ports/Queryable";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";

export class PgUsuarioSistemaRepository implements UsuarioSistemaRepository {
  constructor(private readonly db: Queryable) {}

  async listarSistemasPermitidos(usuarioId: number): Promise<number[]> {
    const { rows } = await this.db.query<{ sistema_id: number }>(
      `SELECT sistema_id FROM felipe_system.usuario_sistemas WHERE usuario_id = $1`,
      [usuarioId],
    );
    return rows.map((r) => r.sistema_id);
  }

  async conceder(usuarioId: number, sistemaId: number): Promise<void> {
    await this.db.query(
      `INSERT INTO felipe_system.usuario_sistemas (usuario_id, sistema_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [usuarioId, sistemaId],
    );
  }

  async revogar(usuarioId: number, sistemaId: number): Promise<void> {
    await this.db.query(
      `DELETE FROM felipe_system.usuario_sistemas WHERE usuario_id = $1 AND sistema_id = $2`,
      [usuarioId, sistemaId],
    );
  }
}
