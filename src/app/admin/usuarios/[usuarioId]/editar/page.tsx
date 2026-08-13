"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/presentation/ui/components/Button";
import { ConfirmDialog } from "@/presentation/ui/components/ConfirmDialog";
import { Field } from "@/presentation/ui/components/Field";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { FormCard } from "@/presentation/ui/components/FormCard";
import { Select } from "@/presentation/ui/components/Select";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import {
  useConcederAcesso,
  useDeletarUsuario,
  useEditarUsuario,
  useRevogarAcesso,
  useUsuariosAdmin,
} from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { Papel } from "@/presentation/ui/features/admin/types";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function EditarUsuarioPage({ params }: { params: Promise<{ usuarioId: string }> }) {
  const { usuarioId: usuarioIdParam } = use(params);
  const usuarioId = Number(usuarioIdParam);
  const router = useRouter();
  const usuarios = useUsuariosAdmin();
  const projetos = useProjetos();
  const editar = useEditarUsuario();
  const deletar = useDeletarUsuario();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const usuario = usuarios.data?.find((u) => u.id === usuarioId);

  if (usuarios.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (usuarios.isError) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState mensagem="Não foi possível carregar o usuário." aoTentarNovamente={() => usuarios.refetch()} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState mensagem="Usuário não encontrado." />
      </div>
    );
  }

  return (
    <>
      <FormCard
        titulo="Editar usuário"
        descricao={usuario.email}
        voltarHref="/admin/usuarios"
        voltarRotulo="Usuários"
        rodape={
          <div className="flex flex-col gap-3">
            {projetos.isSuccess && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-sm font-medium text-foreground">Acesso a projetos</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {projetos.data.map((projeto) => (
                    <AcessoToggle
                      key={projeto.id}
                      usuarioId={usuario.id}
                      sistemaId={projeto.id}
                      nome={projeto.nome}
                      concedido={usuario.sistemasPermitidos.includes(projeto.id)}
                    />
                  ))}
                  {projetos.data.length === 0 && <p className="text-sm text-muted">Nenhum projeto criado ainda.</p>}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-critical/30 p-4">
              <p className="text-sm font-medium text-foreground">Zona de risco</p>
              <p className="mt-0.5 text-xs text-muted">Excluir remove o usuário e seus acessos permanentemente.</p>
              <Button
                type="button"
                variante="danger"
                icone={Trash2}
                className="mt-3"
                onClick={() => setConfirmandoExclusao(true)}
              >
                Excluir usuário
              </Button>
            </div>
          </div>
        }
      >
        <FormularioEdicao
          usuarioId={usuario.id}
          nomeInicial={usuario.nome}
          papelInicial={usuario.papel}
          ativoInicial={usuario.ativo}
          salvando={editar.isPending}
          erro={editar.error}
          onSalvar={(dados) => editar.mutate({ usuarioId: usuario.id, ...dados })}
        />
      </FormCard>

      {confirmandoExclusao && (
        <ConfirmDialog
          titulo="Excluir usuário"
          mensagem={`Tem certeza que quer excluir "${usuario.nome}"? Isso não pode ser desfeito.`}
          rotuloConfirmar="Excluir"
          confirmando={deletar.isPending}
          erro={deletar.error}
          onFechar={() => setConfirmandoExclusao(false)}
          onConfirmar={() => deletar.mutate(usuarioId, { onSuccess: () => router.push("/admin/usuarios") })}
        />
      )}
    </>
  );
}

function FormularioEdicao({
  usuarioId,
  nomeInicial,
  papelInicial,
  ativoInicial,
  salvando,
  erro,
  onSalvar,
}: {
  usuarioId: number;
  nomeInicial: string;
  papelInicial: Papel;
  ativoInicial: boolean;
  salvando: boolean;
  erro: unknown;
  onSalvar: (dados: { nome: string; papel: Papel; ativo: boolean }) => void;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [papel, setPapel] = useState<Papel>(papelInicial);
  const [ativo, setAtivo] = useState(ativoInicial);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSalvar({ nome, papel, ativo });
  }

  const mensagemErro =
    erro instanceof ErroHttp ? erro.message : erro ? "Não foi possível salvar o usuário." : null;

  return (
    <form key={usuarioId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <Select label="Papel" value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
        <option value="operador">Operador</option>
        <option value="admin">Admin</option>
      </Select>
      <label className="flex min-h-[44px] items-center justify-between rounded-lg border border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">Usuário ativo</span>
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 accent-accent" />
      </label>
      {mensagemErro && (
        <p role="alert" className="text-sm text-critical">
          {mensagemErro}
        </p>
      )}
      <Button type="submit" icone={Save} carregando={salvando} className="self-start">
        Salvar alterações
      </Button>
    </form>
  );
}

function AcessoToggle({
  usuarioId,
  sistemaId,
  nome,
  concedido,
}: {
  usuarioId: number;
  sistemaId: number;
  nome: string;
  concedido: boolean;
}) {
  const conceder = useConcederAcesso();
  const revogar = useRevogarAcesso();
  const carregando = conceder.isPending || revogar.isPending;

  return (
    <button
      type="button"
      disabled={carregando}
      onClick={() =>
        concedido ? revogar.mutate({ usuarioId, sistemaId }) : conceder.mutate({ usuarioId, sistemaId })
      }
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        concedido ? "bg-accent/15 text-accent" : "bg-border/60 text-muted hover:bg-border"
      }`}
    >
      {nome}
    </button>
  );
}
