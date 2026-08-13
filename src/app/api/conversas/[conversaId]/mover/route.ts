import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { moverConversaSchema } from "@/presentation/http/schemas/conversas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = moverConversaSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const { conversaId } = await params;

  try {
    const resultado = await container().useCases.moverConversaDeStatus.execute({
      conversaId: Number(conversaId),
      novoStatus: corpo.data.novoStatus,
      usuarioId: usuario.usuarioId,
      sistemasPermitidos: usuario.sistemasPermitidos,
    });
    return NextResponse.json(resultado);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
