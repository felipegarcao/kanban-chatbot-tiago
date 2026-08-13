import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { configurarColunasSchema } from "@/presentation/http/schemas/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sistemaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const { sistemaId } = await params;
  const incluirOcultas = new URL(req.url).searchParams.get("todas") === "1";

  try {
    const colunas = await container().useCases.listarColunasDoProjeto.execute({
      sistemaId: Number(sistemaId),
      sistemasPermitidos: usuario.sistemasPermitidos,
      apenasVisiveis: !incluirOcultas,
    });
    return NextResponse.json(colunas);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sistemaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = configurarColunasSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const { sistemaId } = await params;

  try {
    await container().useCases.configurarColunasDoProjeto.execute({
      papel: usuario.papel,
      sistemaId: Number(sistemaId),
      colunas: corpo.data.colunas,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
