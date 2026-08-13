import { EmailJaCadastrado } from "@/core/domain/errors/DomainError";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { SessionService } from "@/core/application/ports/SessionService";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";

export interface RegistrarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

export interface RegistrarUsuarioOutput {
  token: string;
  usuarioId: number;
  nome: string;
  papel: "admin" | "operador";
  sistemasPermitidos: number[];
}

/**
 * Autocadastro público: qualquer pessoa com o link cria a própria conta, sem aprovação
 * prévia. Fica sempre `papel = 'operador'` (autocadastro nunca vira admin) e sem nenhum
 * projeto vinculado — quem concede acesso a um projeto é um admin depois, em
 * /admin/usuarios/:id/editar. Loga automaticamente ao final; a tela do painel já mostra o
 * estado "nenhum projeto disponível" pra quem acabou de se cadastrar.
 */
export class RegistrarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: Hasher,
    private readonly sessoes: SessionService,
  ) {}

  async execute(input: RegistrarUsuarioInput): Promise<RegistrarUsuarioOutput> {
    const email = input.email.trim().toLowerCase();
    const existente = await this.usuarios.buscarPorEmail(email);
    if (existente) {
      throw new EmailJaCadastrado(email);
    }

    const senhaHash = await this.hasher.hash(input.senha);
    const usuario = await this.usuarios.criar({
      nome: input.nome,
      email,
      senhaHash,
      papel: "operador",
    });

    const token = await this.sessoes.criar({ usuarioId: usuario.id, papel: usuario.papel });

    return {
      token,
      usuarioId: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
      sistemasPermitidos: [],
    };
  }
}
