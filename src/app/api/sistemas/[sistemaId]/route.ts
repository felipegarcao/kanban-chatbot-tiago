import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { editarProjetoSchema } from "@/presentation/http/schemas/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sistemaId: string }> },
): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = editarProjetoSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  const { sistemaId } = await params;
  const id = Number(sistemaId);
  const { editarProjeto, ativarDesativarProjeto } = container().useCases;

  try {
    if (corpo.data.nome !== undefined || corpo.data.descricao !== undefined) {
      await editarProjeto.execute({
        papel: usuario.papel,
        sistemaId: id,
        nome: corpo.data.nome,
        descricao: corpo.data.descricao,
      });
    }
    if (corpo.data.ativo !== undefined) {
      await ativarDesativarProjeto.execute({ papel: usuario.papel, sistemaId: id, ativo: corpo.data.ativo });
    }
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
