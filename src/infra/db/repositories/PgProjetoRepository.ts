import type { NovoProjeto, ProjetoRepository } from "@/core/application/ports/ProjetoRepository";
import type { Queryable } from "@/core/application/ports/Queryable";
import type { Projeto } from "@/core/domain/Projeto";
import { paraDominio, type ProjetoRow } from "@/infra/db/mappers/projetoMapper";

export class PgProjetoRepository implements ProjetoRepository {
  constructor(private readonly db: Queryable) {}

  async buscarPorId(id: number): Promise<Projeto | null> {
    const { rows } = await this.db.query<ProjetoRow>(
      `SELECT id, nome, descricao, ativo, criado_em FROM felipe_system.sistemas WHERE id = $1`,
      [id],
    );
    return rows[0] ? paraDominio(rows[0]) : null;
  }

  async listar(): Promise<Projeto[]> {
    const { rows } = await this.db.query<ProjetoRow>(
      `SELECT id, nome, descricao, ativo, criado_em FROM felipe_system.sistemas ORDER BY nome`,
    );
    return rows.map(paraDominio);
  }

  async listarPorIds(ids: readonly number[]): Promise<Projeto[]> {
    if (ids.length === 0) return [];
    const { rows } = await this.db.query<ProjetoRow>(
      `SELECT id, nome, descricao, ativo, criado_em FROM felipe_system.sistemas
       WHERE id = ANY($1::int[]) ORDER BY nome`,
      [ids],
    );
    return rows.map(paraDominio);
  }

  async criar(projeto: NovoProjeto): Promise<Projeto> {
    const { rows } = await this.db.query<ProjetoRow>(
      `INSERT INTO felipe_system.sistemas (nome, descricao, ativo)
       VALUES ($1, $2, TRUE)
       RETURNING id, nome, descricao, ativo, criado_em`,
      [projeto.nome, projeto.descricao],
    );
    return paraDominio(rows[0]!);
  }

  async salvar(projeto: Projeto): Promise<void> {
    const props = projeto.toProps();
    await this.db.query(
      `UPDATE felipe_system.sistemas SET nome = $2, descricao = $3, ativo = $4 WHERE id = $1`,
      [props.id, props.nome, props.descricao, props.ativo],
    );
  }
}
