import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import type { StatusConversa } from "@/core/domain/Conversa";

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
  const status = url.searchParams.get("status") as StatusConversa | null;
  const busca = url.searchParams.get("busca") ?? undefined;
  const cursor = url.searchParams.get("cursor");
  const limiteParam = url.searchParams.get("limite");

  try {
    const pagina = await container().useCases.listarConversasDoProjeto.execute({
      sistemaId: Number(sistemaId),
      sistemasPermitidos: usuario.sistemasPermitidos,
      status: status ?? undefined,
      busca,
      cursor,
      limite: limiteParam ? Number(limiteParam) : undefined,
    });

    return NextResponse.json({
      itens: pagina.itens.map((c) => c.toProps()),
      proximoCursor: pagina.proximoCursor,
    });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
