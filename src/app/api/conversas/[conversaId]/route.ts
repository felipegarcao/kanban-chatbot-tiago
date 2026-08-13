import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const { conversaId } = await params;

  try {
    const detalhe = await container().useCases.obterDetalheDaConversa.execute({
      conversaId: Number(conversaId),
      sistemasPermitidos: usuario.sistemasPermitidos,
    });

    return NextResponse.json({
      conversa: detalhe.conversa.toProps(),
      mensagens: detalhe.mensagens,
      eventos: detalhe.eventos,
    });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
