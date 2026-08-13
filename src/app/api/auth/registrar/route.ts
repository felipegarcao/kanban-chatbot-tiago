import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { excedeuLimiteDeRegistro, obterIp, registrarTentativaDeRegistro } from "@/presentation/http/rateLimiter";
import { registrarSchema } from "@/presentation/http/schemas/auth";
import { definirCookieSessao } from "@/presentation/http/sessionCookie";

/**
 * Autocadastro público — sem sessão, sem papel admin exigido. Qualquer um com o link chega
 * até aqui. A conta nasce sem nenhum projeto vinculado; um admin concede acesso depois.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = obterIp(req);
  if (excedeuLimiteDeRegistro(ip)) {
    return NextResponse.json(
      { erro: "MUITAS_TENTATIVAS", mensagem: "Muitos cadastros a partir deste endereço. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  const corpo = registrarSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  registrarTentativaDeRegistro(ip);

  try {
    const resultado = await container().useCases.registrarUsuario.execute(corpo.data);

    const resposta = NextResponse.json(
      {
        usuarioId: resultado.usuarioId,
        nome: resultado.nome,
        papel: resultado.papel,
        sistemasPermitidos: resultado.sistemasPermitidos,
      },
      { status: 201 },
    );
    definirCookieSessao(resposta, resultado.token);
    return resposta;
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
