"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { EmptyState } from "@/presentation/ui/components/EmptyState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import { useCriarProjeto } from "@/presentation/ui/features/sistemas/useCriarProjeto";
import { useEditarProjeto } from "@/presentation/ui/features/sistemas/useEditarProjeto";

export default function AdminProjetosPage() {
  const projetos = useProjetos();
  const criar = useCriarProjeto();
  const editar = useEditarProjeto();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function handleCriar(e: FormEvent) {
    e.preventDefault();
    criar.mutate(
      { nome, descricao: descricao.trim() || null },
      { onSuccess: () => { setNome(""); setDescricao(""); } },
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <section>
        <h1 className="text-lg font-semibold text-foreground">Projetos</h1>

        {projetos.isPending && (
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {projetos.isError && (
          <div className="mt-3">
            <ErrorState mensagem="Não foi possível carregar os projetos." aoTentarNovamente={() => projetos.refetch()} />
          </div>
        )}

        {projetos.isSuccess && projetos.data.length === 0 && (
          <div className="mt-3">
            <EmptyState titulo="Nenhum projeto ainda" />
          </div>
        )}

        {projetos.isSuccess && projetos.data.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {projetos.data.map((projeto) => (
              <li
                key={projeto.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{projeto.nome}</p>
                  {projeto.descricao && <p className="text-xs text-muted">{projeto.descricao}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/sistemas/${projeto.id}/colunas`} className="text-sm text-accent hover:underline">
                    Colunas
                  </Link>
                  <Button
                    variante="secondary"
                    carregando={editar.isPending}
                    onClick={() => editar.mutate({ sistemaId: projeto.id, ativo: !projeto.ativo })}
                  >
                    {projeto.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Novo projeto</h2>
        <form onSubmit={handleCriar} className="mt-3 flex flex-col gap-3">
          <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field label="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <Button type="submit" carregando={criar.isPending} className="self-start">
            Criar projeto
          </Button>
        </form>
      </section>
    </div>
  );
}
