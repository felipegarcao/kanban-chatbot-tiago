import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import {
  excedeuLimiteDeRedefinicao,
  obterIp,
  registrarTentativaDeRedefinicao,
} from "@/presentation/http/rateLimiter";
import { redefinirSenhaSchema } from "@/presentation/http/schemas/auth";

/**
 * Autoatendimento público — sem sessão. O usuário identifica a conta pelo próprio email e já
 * define a nova senha na mesma chamada (não há etapa de link por email nesta versão).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const corpo = redefinirSenhaSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const chaveRateLimit = `${corpo.data.email.trim().toLowerCase()}:${obterIp(req)}`;
  if (excedeuLimiteDeRedefinicao(chaveRateLimit)) {
    return NextResponse.json(
      { erro: "MUITAS_TENTATIVAS", mensagem: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );
  }
  registrarTentativaDeRedefinicao(chaveRateLimit);

  try {
    await container().useCases.redefinirSenha.execute({
      email: corpo.data.email,
      senhaNova: corpo.data.senhaNova,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
