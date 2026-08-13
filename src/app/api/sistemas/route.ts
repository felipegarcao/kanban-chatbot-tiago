import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { criarProjetoSchema } from "@/presentation/http/schemas/admin";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const projetos = await container().useCases.listarProjetos.execute({
    usuarioId: usuario.usuarioId,
    papel: usuario.papel,
  });

  return NextResponse.json(projetos.map((p) => p.toProps()));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = criarProjetoSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const projeto = await container().useCases.criarProjeto.execute({
      papel: usuario.papel,
      usuarioId: usuario.usuarioId,
      nome: corpo.data.nome,
      descricao: corpo.data.descricao,
    });
    return NextResponse.json(projeto.toProps(), { status: 201 });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
