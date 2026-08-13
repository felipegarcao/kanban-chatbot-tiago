import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { NOME_COOKIE_SESSAO } from "@/presentation/http/sessionCookie";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  if (!token) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const usuario = await container().useCases.obterUsuarioLogado.execute(token);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  return NextResponse.json(usuario);
}
