import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { confirmarPagamentoSchema } from "@/presentation/http/schemas/conversas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = confirmarPagamentoSchema.safeParse(await req.json().catch(() => ({})));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const { conversaId } = await params;

  try {
    await container().useCases.confirmarPagamento.execute({
      conversaId: Number(conversaId),
      usuarioId: usuario.usuarioId,
      sistemasPermitidos: usuario.sistemasPermitidos,
      valor: corpo.data.valor,
      observacao: corpo.data.observacao,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
