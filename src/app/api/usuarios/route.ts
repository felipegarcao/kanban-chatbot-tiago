import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { criarUsuarioSchema } from "@/presentation/http/schemas/admin";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  try {
    const usuarios = await container().useCases.listarUsuarios.execute({ papel: usuario.papel });
    return NextResponse.json(usuarios);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = criarUsuarioSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const novoUsuario = await container().useCases.criarUsuario.execute({
      papel: usuario.papel,
      nome: corpo.data.nome,
      email: corpo.data.email,
      senha: corpo.data.senha,
      papelNovoUsuario: corpo.data.papel,
    });
    const props = novoUsuario.toProps();
    return NextResponse.json(
      { id: props.id, nome: props.nome, email: props.email, papel: props.papel, ativo: props.ativo },
      { status: 201 },
    );
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
