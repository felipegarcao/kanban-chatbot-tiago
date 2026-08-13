import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { lerIntervaloDaQuery } from "@/presentation/http/intervaloDeDatas";
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
  const url = new URL(req.url);
  const { intervalo, erro: erroIntervalo } = lerIntervaloDaQuery(url);
  if (erroIntervalo) return erroIntervalo;

  try {
    const contagens = await container().useCases.contarConversasPorStatus.execute({
      sistemaId: Number(sistemaId),
      sistemasPermitidos: usuario.sistemasPermitidos,
      dataInicio: intervalo.dataInicio,
      dataFim: intervalo.dataFim,
    });
    return NextResponse.json(contagens);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
