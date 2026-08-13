import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { editarUsuarioSchema } from "@/presentation/http/schemas/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ usuarioId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = editarUsuarioSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const { usuarioId } = await params;

  try {
    await container().useCases.editarUsuario.execute({
      papel: usuario.papel,
      usuarioId: Number(usuarioId),
      nome: corpo.data.nome,
      papelNovo: corpo.data.papel,
      ativo: corpo.data.ativo,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
