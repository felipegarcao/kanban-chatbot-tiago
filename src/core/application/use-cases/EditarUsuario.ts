import { UsuarioNaoEncontrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface EditarUsuarioInput {
  papel: Papel;
  usuarioId: number;
  nome?: string;
  papelNovo?: Papel;
  ativo?: boolean;
  senhaNova?: string;
}

/** Só um admin chega aqui (`garantirAdmin`); por isso a troca de senha não exige a senha atual — é um reset administrativo, não o autoatendimento do próprio usuário. */
export class EditarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(input: EditarUsuarioInput): Promise<void> {
    garantirAdmin(input.papel);
    const usuario = await this.usuarios.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontrado(input.usuarioId);
    }

    if (input.nome !== undefined) usuario.renomear(input.nome);
    if (input.papelNovo !== undefined) usuario.redefinirPapel(input.papelNovo);
    if (input.ativo !== undefined) {
      if (input.ativo) usuario.ativar();
      else usuario.desativar();
    }
    if (input.senhaNova !== undefined) {
      usuario.redefinirSenha(await this.hasher.hash(input.senhaNova));
    }

    await this.usuarios.salvar(usuario);
  }
}
