import type { Usuario, Papel } from "@/core/domain/Usuario";

export interface NovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
}

export interface UsuarioRepository {
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  criar(usuario: NovoUsuario): Promise<Usuario>;
}
