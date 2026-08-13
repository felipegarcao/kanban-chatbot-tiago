export interface UsuarioSistemaRepository {
  listarSistemasPermitidos(usuarioId: number): Promise<number[]>;
  conceder(usuarioId: number, sistemaId: number): Promise<void>;
  revogar(usuarioId: number, sistemaId: number): Promise<void>;
}
