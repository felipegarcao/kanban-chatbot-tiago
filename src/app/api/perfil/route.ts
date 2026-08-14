import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infra/container";
import { errorParaResposta } from "@/presentation/http/errorParaResposta";
import { obterUsuarioDaRequisicao } from "@/presentation/http/obterUsuarioDaRequisicao";
import { atualizarPerfilSchema } from "@/presentation/http/schemas/perfil";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const usuario = await obterUsuarioDaRequisicao(req);
  if (!usuario) {
    return NextResponse.json({ erro: "NAO_AUTENTICADO" }, { status: 401 });
  }

  const corpo = atualizarPerfilSchema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem: corpo.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const resultado = await container().useCases.atualizarMeuPerfil.execute({
      usuarioId: usuario.usuarioId,
      nome: corpo.data.nome,
      email: corpo.data.email,
    });
    return NextResponse.json(resultado);
  } catch (erro) {
    return errorParaResposta(erro);
  }
}
