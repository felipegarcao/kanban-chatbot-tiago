import type { SessionService } from "@/core/application/ports/SessionService";
import type { UsuarioRepository } from "@/core/application/ports/UsuarioRepository";
import type { UsuarioSistemaRepository } from "@/core/application/ports/UsuarioSistemaRepository";
import type { Papel } from "@/core/domain/Usuario";

export interface UsuarioLogado {
  usuarioId: number;
  nome: string;
  email: string;
  papel: Papel;
  sistemasPermitidos: number[];
}

export class ObterUsuarioLogado {
  constructor(
    private readonly sessoes: SessionService,
    private readonly usuarios: UsuarioRepository,
    private readonly usuarioSistemas: UsuarioSistemaRepository,
  ) {}

  async execute(token: string): Promise<UsuarioLogado | null> {
    const payload = await this.sessoes.verificar(token);
    if (!payload) return null;

    const usuario = await this.usuarios.buscarPorId(payload.usuarioId);
    if (!usuario || !usuario.ativo) return null;

    const sistemasPermitidos = await this.usuarioSistemas.listarSistemasPermitidos(usuario.id);

    return {
      usuarioId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      sistemasPermitidos,
    };
  }
}
