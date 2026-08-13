"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import {
  useConcederAcesso,
  useCriarUsuario,
  useRevogarAcesso,
  useUsuariosAdmin,
} from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { Papel } from "@/presentation/ui/features/admin/types";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function AdminUsuariosPage() {
  const usuarios = useUsuariosAdmin();
  const projetos = useProjetos();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section>
        <h1 className="text-lg font-semibold text-foreground">Usuários</h1>

        {usuarios.isPending && (
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {usuarios.isError && (
          <div className="mt-3">
            <ErrorState mensagem="Não foi possível carregar os usuários." aoTentarNovamente={() => usuarios.refetch()} />
          </div>
        )}

        {usuarios.isSuccess && (
          <ul className="mt-3 flex flex-col gap-3">
            {usuarios.data.map((usuario) => (
              <li key={usuario.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {usuario.nome} <span className="text-xs text-muted">({usuario.papel})</span>
                    </p>
                    <p className="text-xs text-muted">{usuario.email}</p>
                  </div>
                  {!usuario.ativo && <span className="text-xs text-critical">inativo</span>}
                </div>

                {projetos.isSuccess && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {projetos.data.map((projeto) => (
                      <AcessoToggle key={projeto.id} usuarioId={usuario.id} sistemaId={projeto.id} nome={projeto.nome} concedido={usuario.sistemasPermitidos.includes(projeto.id)} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <FormularioNovoUsuario />
    </div>
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

function FormularioNovoUsuario() {
  const criar = useCriarUsuario();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("operador");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    criar.mutate(
      { nome, email, senha, papel },
      { onSuccess: () => { setNome(""); setEmail(""); setSenha(""); setPapel("operador"); } },
    );
  }

  const mensagemErro =
    criar.error instanceof ErroHttp ? criar.error.message : criar.isError ? "Não foi possível criar o usuário." : null;

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">Novo usuário</h2>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} />
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
        {mensagemErro && <p role="alert" className="text-sm text-critical">{mensagemErro}</p>}
        <Button type="submit" carregando={criar.isPending} className="self-start">
          Criar usuário
        </Button>
      </form>
    </section>
  );
}
