import { EmailJaCadastrado, UsuarioNaoEncontrado } from "@/core/domain/errors/DomainError";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";

export interface AtualizarMeuPerfilInput {
  usuarioId: number;
  nome?: string;
  email?: string;
}

export interface AtualizarMeuPerfilOutput {
  nome: string;
  email: string;
}

/**
 * Auto-edição de perfil: o alvo é sempre o próprio `usuarioId` da sessão, nunca um id
 * arbitrário — ao contrário de EditarUsuario (admin-only, edita qualquer usuário).
 */
export class AtualizarMeuPerfil {
  constructor(private readonly usuarios: UsuarioRepository) {}

  async execute(input: AtualizarMeuPerfilInput): Promise<AtualizarMeuPerfilOutput> {
    const usuario = await this.usuarios.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontrado(input.usuarioId);
    }

    if (input.nome !== undefined) {
      usuario.renomear(input.nome);
    }

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      const existente = await this.usuarios.buscarPorEmail(email);
      if (existente && existente.id !== usuario.id) {
        throw new EmailJaCadastrado(email);
      }
      usuario.alterarEmail(email);
    }

    await this.usuarios.salvar(usuario);

    return { nome: usuario.nome, email: usuario.email };
  }
}
