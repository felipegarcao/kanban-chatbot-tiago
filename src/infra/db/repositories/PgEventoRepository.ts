import type { Evento, EventoRepository } from "@/core/application/ports/EventoRepository";
import type { Queryable } from "@/core/application/ports/Queryable";
import type { EventoDominio } from "@/core/domain/Conversa";

interface EventoRow {
  id: number;
  conversa_id: number;
  tipo: string;
  detalhes: Record<string, unknown> | null;
  criado_em: Date;
}

export class PgEventoRepository implements EventoRepository {
  constructor(private readonly db: Queryable) {}

  async listarPorConversa(conversaId: number): Promise<Evento[]> {
    const { rows } = await this.db.query<EventoRow>(
      `SELECT id, conversa_id, tipo, detalhes, criado_em FROM felipe_system.eventos
       WHERE conversa_id = $1 ORDER BY criado_em ASC`,
      [conversaId],
    );
    return rows.map((r) => ({
      id: r.id,
      conversaId: r.conversa_id,
      tipo: r.tipo,
      detalhes: r.detalhes ?? {},
      criadoEm: r.criado_em,
    }));
  }

  async registrar(conversaId: number, evento: EventoDominio): Promise<void> {
    await this.db.query(
      `INSERT INTO felipe_system.eventos (conversa_id, tipo, detalhes) VALUES ($1, $2, $3::jsonb)`,
      [conversaId, evento.tipo, JSON.stringify(evento.detalhes)],
    );
  }
}
