import { CredenciaisInvalidas } from "@/core/domain/errors/DomainError";
import type { Hasher } from "@/core/application/ports/Hasher";
import type { SessionService } from "@/core/application/ports/SessionService";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";

export interface AutenticarUsuarioInput {
  email: string;
  senha: string;
}

export interface AutenticarUsuarioOutput {
  token: string;
  usuarioId: number;
  nome: string;
  papel: "admin" | "operador";
  sistemasPermitidos: number[];
}

export class AutenticarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
    private readonly hasher: Hasher,
    private readonly sessoes: SessionService,
  ) {}

  async execute(input: AutenticarUsuarioInput): Promise<AutenticarUsuarioOutput> {
    const usuario = await this.usuarios.buscarPorEmail(input.email.trim().toLowerCase());
    if (!usuario) {
      throw new CredenciaisInvalidas();
    }

    const senhaValida = await this.hasher.verificar(input.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidas();
    }

    usuario.garantirAtivo();

    const sistemasPermitidos = await this.usuarioSistemas.listarSistemasPermitidos(usuario.id);
    const token = await this.sessoes.criar({ usuarioId: usuario.id, papel: usuario.papel });

    return {
      token,
      usuarioId: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
      sistemasPermitidos,
    };
  }
}
