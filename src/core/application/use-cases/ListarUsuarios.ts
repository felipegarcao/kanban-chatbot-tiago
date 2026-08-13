import { garantirAdmin } from "@/core/domain/permissoes";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface ListarUsuariosInput {
  papel: Papel;
}

export interface UsuarioComAcessos {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  sistemasPermitidos: number[];
}

export class ListarUsuarios {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
  ) {}

  async execute(input: ListarUsuariosInput): Promise<UsuarioComAcessos[]> {
    garantirAdmin(input.papel);
    const usuarios = await this.usuarios.listar();
    return Promise.all(
      usuarios.map(async (usuario) => ({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        ativo: usuario.ativo,
        sistemasPermitidos: await this.usuarioSistemas.listarSistemasPermitidos(usuario.id),
      })),
    );
  }
}
