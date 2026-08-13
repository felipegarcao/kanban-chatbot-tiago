import {
  NaoPodeExcluirProprioUsuario,
  NaoPodeExcluirUltimoAdmin,
  UsuarioNaoEncontrado,
} from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface DeletarUsuarioInput {
  papel: Papel;
  usuarioIdSolicitante: number;
  usuarioId: number;
}

export class DeletarUsuario {
  constructor(private readonly usuarios: UsuarioRepository) {}

  async execute(input: DeletarUsuarioInput): Promise<void> {
    garantirAdmin(input.papel);

    if (input.usuarioId === input.usuarioIdSolicitante) {
      throw new NaoPodeExcluirProprioUsuario();
    }

    const usuario = await this.usuarios.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontrado(input.usuarioId);
    }

    if (usuario.isAdmin() && usuario.ativo) {
      const totalAdminsAtivos = await this.usuarios.contarAdminsAtivos();
      if (totalAdminsAtivos <= 1) {
        throw new NaoPodeExcluirUltimoAdmin();
      }
    }

    await this.usuarios.deletar(input.usuarioId);
  }
}
