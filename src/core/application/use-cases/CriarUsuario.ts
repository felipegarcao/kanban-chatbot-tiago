import { EmailJaCadastrado } from "@/core/domain/errors/DomainError";
import { garantirAdmin } from "@/core/domain/permissoes";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { Usuario, Papel } from "@/core/domain/Usuario";

export interface CriarUsuarioInput {
  papel: Papel;
  nome: string;
  email: string;
  senha: string;
  papelNovoUsuario: Papel;
}

export class CriarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(input: CriarUsuarioInput): Promise<Usuario> {
    garantirAdmin(input.papel);

    const email = input.email.trim().toLowerCase();
    const existente = await this.usuarios.buscarPorEmail(email);
    if (existente) {
      throw new EmailJaCadastrado(email);
    }

    const senhaHash = await this.hasher.hash(input.senha);
    return this.usuarios.criar({
      nome: input.nome,
      email,
      senhaHash,
      papel: input.papelNovoUsuario,
    });
  }
}
