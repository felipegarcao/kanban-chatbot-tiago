import type { NextResponse } from "next/server";
import { env } from "@/infra/config/env";

export const NOME_COOKIE_SESSAO = "painel_sessao";
const DURACAO_COOKIE_SEGUNDOS = 60 * 60 * 2; // 2h, igual à duração do JWT

export function definirCookieSessao(resposta: NextResponse, token: string): void {
  resposta.cookies.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_COOKIE_SEGUNDOS,
  });
}

export function limparCookieSessao(resposta: NextResponse): void {
  resposta.cookies.set(NOME_COOKIE_SESSAO, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
