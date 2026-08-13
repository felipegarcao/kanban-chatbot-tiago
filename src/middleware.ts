import { NextRequest, NextResponse } from "next/server";
import { env } from "@/infra/config/env";
import { JoseSessionService } from "@/infra/auth/JoseSessionService";
import { NOME_COOKIE_SESSAO } from "@/presentation/http/sessionCookie";

/**
 * Conveniência de UX, não a garantia real: só confere que o JWT é válido e (para /admin)
 * que o papel embutido no token é 'admin'. A garantia de verdade — inclusive permissão por
 * projeto — vive nos casos de uso, que revalidam tudo contra o banco a cada chamada.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const sessoes = new JoseSessionService(env.SESSION_SECRET);
  const payload = token ? await sessoes.verificar(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.nextUrl.pathname.startsWith("/admin") && payload.papel !== "admin") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
