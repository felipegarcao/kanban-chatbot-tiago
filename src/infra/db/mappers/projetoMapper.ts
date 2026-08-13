import { Projeto } from "@/core/domain/Projeto";

export interface ProjetoRow {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: Date;
}

export function paraDominio(row: ProjetoRow): Projeto {
  return Projeto.reconstituir({
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    ativo: row.ativo,
    criadoEm: row.criado_em,
  });
}
