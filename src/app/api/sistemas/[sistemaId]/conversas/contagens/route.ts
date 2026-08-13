import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sistemaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const { sistemaId } = await params;

  try {
    const contagens = await container().useCases.contarConversasPorStatus.execute({
      sistemaId: Number(sistemaId),
      sistemasPermitidos: usuario.sistemasPermitidos,
    });
    return NextResponse.json(contagens);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
