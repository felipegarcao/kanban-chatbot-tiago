import { UsuarioNaoEncontrado } from "@/core/domain/errors/DomainError";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";

export interface RedefinirSenhaInput {
  email: string;
  senhaNova: string;
}

/** Reset de senha por email, sem exigir a senha atual — fluxo de "esqueci minha senha". */
export class RedefinirSenha {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(input: RedefinirSenhaInput): Promise<void> {
    const usuario = await this.usuarios.buscarPorEmail(input.email.trim().toLowerCase());
    if (!usuario) {
      throw new UsuarioNaoEncontrado(input.email);
    }

    const senhaHash = await this.hasher.hash(input.senhaNova);
    usuario.redefinirSenha(senhaHash);

    await this.usuarios.salvar(usuario);
  }
}
