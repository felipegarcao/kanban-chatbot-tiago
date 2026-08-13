import { NextResponse } from "next/server";
import { limparCookieSessao } from "@/presentation/http/sessionCookie";

export async function POST(): Promise<NextResponse> {
  const resposta = NextResponse.json({ ok: true });
  limparCookieSessao(resposta);
  return resposta;
}
