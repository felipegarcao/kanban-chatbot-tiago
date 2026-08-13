import type { Queryable } from "@/core/application/ports/Queryable";
import type { NovoUsuario, UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { Usuario } from "@/core/domain/Usuario";
import { paraDominio, type UsuarioRow } from "@/infra/db/mappers/usuarioMapper";

export class PgUsuarioRepository implements UsuarioRepository {
  constructor(private readonly db: Queryable) {}

  async buscarPorId(id: number): Promise<Usuario | null> {
    const { rows } = await this.db.query<UsuarioRow>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM felipe_system.usuarios WHERE id = $1`,
      [id],
    );
    return rows[0] ? paraDominio(rows[0]) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { rows } = await this.db.query<UsuarioRow>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM felipe_system.usuarios WHERE email = $1`,
      [email],
    );
    return rows[0] ? paraDominio(rows[0]) : null;
  }

  async listar(): Promise<Usuario[]> {
    const { rows } = await this.db.query<UsuarioRow>(
      `SELECT id, nome, email, senha_hash, papel, ativo, criado_em
       FROM felipe_system.usuarios ORDER BY nome`,
    );
    return rows.map(paraDominio);
  }

  async criar(usuario: NovoUsuario): Promise<Usuario> {
    const { rows } = await this.db.query<UsuarioRow>(
      `INSERT INTO felipe_system.usuarios (nome, email, senha_hash, papel, ativo)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, nome, email, senha_hash, papel, ativo, criado_em`,
      [usuario.nome, usuario.email, usuario.senhaHash, usuario.papel],
    );
    return paraDominio(rows[0]!);
  }
}
