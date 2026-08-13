import type { NextRequest } from "next/server";
import { container } from "@/infra/container";
import type { UsuarioLogado } from "@/core/application/use-cases/ObterUsuarioLogado";
import { NOME_COOKIE_SESSAO } from "@/presentation/http/sessionCookie";

export async function obterUsuarioDaRequisicao(req: NextRequest): Promise<UsuarioLogado | null> {
  const token = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  if (!token) return null;
  return container().useCases.obterUsuarioLogado.execute(token);
}
