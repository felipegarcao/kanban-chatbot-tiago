import type { Mensagem, MensagemRepository } from "@/core/application/ports/MensagemRepository";
import type { Queryable } from "@/core/application/ports/Queryable";

interface MensagemRow {
  id: number;
  conversa_id: number;
  autor: string;
  conteudo: string | null;
  criada_em: Date;
}

export class PgMensagemRepository implements MensagemRepository {
  constructor(private readonly db: Queryable) {}

  async listarUltimasPorConversa(conversaId: number, limite: number): Promise<Mensagem[]> {
    const { rows } = await this.db.query<MensagemRow>(
      `SELECT id, conversa_id, autor, conteudo, criada_em FROM felipe_system.mensagens
       WHERE conversa_id = $1 ORDER BY criada_em DESC LIMIT $2`,
      [conversaId, limite],
    );
    return rows
      .map((r) => ({
        id: r.id,
        conversaId: r.conversa_id,
        autor: r.autor as Mensagem["autor"],
        conteudo: r.conteudo,
        criadoEm: r.criada_em,
      }))
      .reverse();
  }
}
