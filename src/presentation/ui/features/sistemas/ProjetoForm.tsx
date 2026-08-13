"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";
import type { ProjetoResumo } from "./types";

interface ProjetoFormProps {
  projeto?: ProjetoResumo;
  onSalvar: (dados: { nome: string; descricao: string | null; ativo: boolean }) => void;
  salvando: boolean;
  erro: unknown;
}

export function ProjetoForm({ projeto, onSalvar, salvando, erro }: ProjetoFormProps) {
  const [nome, setNome] = useState(projeto?.nome ?? "");
  const [descricao, setDescricao] = useState(projeto?.descricao ?? "");
  const [ativo, setAtivo] = useState(projeto?.ativo ?? true);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSalvar({ nome, descricao: descricao.trim() || null, ativo });
  }

  const mensagemErro =
    erro instanceof ErroHttp ? erro.message : erro ? "Não foi possível salvar o projeto." : null;

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3">
      <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <Field label="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      {projeto && (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo
        </label>
      )}

      {mensagemErro && (
        <p role="alert" className="text-sm text-critical">
          {mensagemErro}
        </p>
      )}

      <Button type="submit" carregando={salvando} className="self-start">
        {projeto ? "Salvar alterações" : "Criar projeto"}
      </Button>
    </form>
  );
}
