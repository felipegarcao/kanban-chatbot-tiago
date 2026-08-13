"use client";

import { use } from "react";
import Link from "next/link";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { ProjetoForm } from "@/presentation/ui/features/sistemas/ProjetoForm";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import { useEditarProjeto } from "@/presentation/ui/features/sistemas/useEditarProjeto";

export default function EditarProjetoPage({ params }: { params: Promise<{ sistemaId: string }> }) {
  const { sistemaId: sistemaIdParam } = use(params);
  const sistemaId = Number(sistemaIdParam);
  const projetos = useProjetos();
  const editar = useEditarProjeto();

  const projeto = projetos.data?.find((p) => p.id === sistemaId);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Projetos
      </Link>

      {projetos.isPending && <Skeleton className="h-40 w-full" />}

      {projetos.isError && (
        <ErrorState mensagem="Não foi possível carregar o projeto." aoTentarNovamente={() => projetos.refetch()} />
      )}

      {projetos.isSuccess && !projeto && <ErrorState mensagem="Projeto não encontrado." />}

      {projeto && (
        <>
          <h1 className="text-lg font-semibold text-foreground">Editar projeto</h1>
          <ProjetoForm
            projeto={projeto}
            salvando={editar.isPending}
            erro={editar.error}
            onSalvar={(dados) => editar.mutate({ sistemaId, ...dados })}
          />
          <Link href={`/admin/sistemas/${sistemaId}/colunas`} className="text-sm text-accent hover:underline">
            Configurar raias do quadro →
          </Link>
        </>
      )}
    </div>
  );
}
