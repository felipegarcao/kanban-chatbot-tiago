export type Papel = "admin" | "operador";

export interface UsuarioSessao {
  usuarioId: number;
  nome: string;
  email: string;
  papel: Papel;
  sistemasPermitidos: number[];
}
