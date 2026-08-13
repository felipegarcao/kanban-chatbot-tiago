"use client";

import { Save } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
      <Field label="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      {projeto && (
        <label className="flex min-h-[44px] items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">Projeto ativo</span>
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
      )}

      {mensagemErro && (
        <p role="alert" className="text-sm text-critical">
          {mensagemErro}
        </p>
      )}

      <Button type="submit" icone={Save} carregando={salvando} className="self-start">
        {projeto ? "Salvar alterações" : "Criar projeto"}
      </Button>
    </form>
  );
}
