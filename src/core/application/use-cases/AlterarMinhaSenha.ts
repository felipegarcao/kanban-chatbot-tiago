import { CredenciaisInvalidas, UsuarioNaoEncontrado } from "@/core/domain/errors/DomainError";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";

export interface AlterarMinhaSenhaInput {
  usuarioId: number;
  senhaAtual: string;
  senhaNova: string;
}

/** Exige a senha atual antes de trocar — não é um reset administrativo, é o próprio usuário. */
export class AlterarMinhaSenha {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(input: AlterarMinhaSenhaInput): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontrado(input.usuarioId);
    }

    const senhaValida = await this.hasher.verificar(input.senhaAtual, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidas();
    }

    const senhaHash = await this.hasher.hash(input.senhaNova);
    usuario.redefinirSenha(senhaHash);

    await this.usuarios.salvar(usuario);
  }
}
