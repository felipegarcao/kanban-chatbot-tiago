"use client";

import { use, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import {
  useConcederAcesso,
  useEditarUsuario,
  useRevogarAcesso,
  useUsuariosAdmin,
} from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { Papel } from "@/presentation/ui/features/admin/types";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function EditarUsuarioPage({ params }: { params: Promise<{ usuarioId: string }> }) {
  const { usuarioId: usuarioIdParam } = use(params);
  const usuarioId = Number(usuarioIdParam);
  const usuarios = useUsuariosAdmin();
  const projetos = useProjetos();
  const editar = useEditarUsuario();

  const usuario = usuarios.data?.find((u) => u.id === usuarioId);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link href="/admin/usuarios" className="text-sm text-muted hover:text-foreground">
        ← Usuários
      </Link>

      {usuarios.isPending && <Skeleton className="h-40 w-full" />}

      {usuarios.isError && (
        <ErrorState mensagem="Não foi possível carregar o usuário." aoTentarNovamente={() => usuarios.refetch()} />
      )}

      {usuarios.isSuccess && !usuario && <ErrorState mensagem="Usuário não encontrado." />}

      {usuario && (
        <>
          <h1 className="text-lg font-semibold text-foreground">Editar usuário</h1>
          <p className="-mt-2 text-sm text-muted">{usuario.email}</p>

          <FormularioEdicao
            usuarioId={usuario.id}
            nomeInicial={usuario.nome}
            papelInicial={usuario.papel}
            ativoInicial={usuario.ativo}
            salvando={editar.isPending}
            erro={editar.error}
            onSalvar={(dados) => editar.mutate({ usuarioId: usuario.id, ...dados })}
          />

          {projetos.isSuccess && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Acesso a projetos</h2>
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
    <form key={usuarioId} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Papel</span>
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value as Papel)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
        Ativo
      </label>
      {mensagemErro && (
        <p role="alert" className="text-sm text-critical">
          {mensagemErro}
        </p>
      )}
      <Button type="submit" carregando={salvando} className="self-start">
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
