import { Usuario, type Papel } from "@/core/domain/Usuario";

export interface UsuarioRow {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  papel: string;
  ativo: boolean;
  criado_em: Date;
}

export function paraDominio(row: UsuarioRow): Usuario {
  return Usuario.reconstituir({
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    papel: row.papel as Papel,
    ativo: row.ativo,
    criadoEm: row.criado_em,
  });
}
