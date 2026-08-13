export type Papel = "admin" | "operador";

export interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  sistemasPermitidos: number[];
}
