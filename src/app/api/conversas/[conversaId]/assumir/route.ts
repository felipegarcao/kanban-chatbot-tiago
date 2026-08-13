import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const { conversaId } = await params;

  try {
    await container().useCases.assumirConversa.execute({
      conversaId: Number(conversaId),
      usuarioId: usuario.usuarioId,
      sistemasPermitidos: usuario.sistemasPermitidos,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
