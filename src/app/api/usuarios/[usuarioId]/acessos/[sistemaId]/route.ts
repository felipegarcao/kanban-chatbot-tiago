import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ usuarioId: string; sistemaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const { usuarioId, sistemaId } = await params;

  try {
    await container().useCases.revogarAcessoAoProjeto.execute({
      papel: usuario.papel,
      usuarioId: Number(usuarioId),
      sistemaId: Number(sistemaId),
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
