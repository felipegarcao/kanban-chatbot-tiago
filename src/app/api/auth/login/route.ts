import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import {
  excedeuLimiteDeTentativas,
  limparTentativas,
  obterIp,
  registrarTentativaFalha,
} from "@/presentation/http/rateLimiter";
import { loginSchema } from "@/presentation/http/schemas/auth";
import { definirCookieSessao } from "@/presentation/http/sessionCookie";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const corpo = loginSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const chaveRateLimit = `${corpo.data.email}:${obterIp(req)}`;
  if (excedeuLimiteDeTentativas(chaveRateLimit)) {
    return NextResponse.json(
      { erro: "MUITAS_TENTATIVAS", mensagem: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );
  }

  try {
    const resultado = await container().useCases.autenticarUsuario.execute(corpo.data);
    limparTentativas(chaveRateLimit);

    const resposta = NextResponse.json({
      usuarioId: resultado.usuarioId,
      nome: resultado.nome,
      papel: resultado.papel,
      sistemasPermitidos: resultado.sistemasPermitidos,
    });
    definirCookieSessao(resposta, resultado.token);
    return resposta;
  } catch (erro) {
    registrarTentativaFalha(chaveRateLimit);
    return errorParaResposta(erro);
  }
}
