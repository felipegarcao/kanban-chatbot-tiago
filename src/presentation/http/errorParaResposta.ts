import { NextResponse } from "next/server";
import { DomainError } from "@/core/domain/errors/DomainError";

const STATUS_POR_CODIGO: Record<string, number> = {
  CONVERSA_NAO_ENCONTRADA: 404,
  USUARIO_NAO_ENCONTRADO: 404,
  PROJETO_NAO_ENCONTRADO: 404,
  SEM_PERMISSAO_NO_PROJETO: 403,
  PERMISSAO_DE_ADMIN_NECESSARIA: 403,
  TRANSICAO_DE_STATUS_INVALIDA: 409,
  CREDENCIAIS_INVALIDAS: 401,
  USUARIO_INATIVO: 403,
  EMAIL_JA_CADASTRADO: 409,
  CONFLITO_DE_CONCORRENCIA: 409,
  PROJETO_POSSUI_CONVERSAS: 409,
  NAO_PODE_EXCLUIR_PROPRIO_USUARIO: 409,
  NAO_PODE_EXCLUIR_ULTIMO_ADMIN: 409,
};

/** Traduz erros de domínio para HTTP — a única camada que conhece esse mapeamento. */
export function errorParaResposta(erro: unknown): NextResponse {
  if (erro instanceof DomainError) {
    const status = STATUS_POR_CODIGO[erro.code] ?? 400;
    return NextResponse.json({ erro: erro.code, mensagem: erro.message }, { status });
  }

  console.error(erro);
  return NextResponse.json({ erro: "ERRO_INTERNO", mensagem: "Erro interno." }, { status: 500 });
}
