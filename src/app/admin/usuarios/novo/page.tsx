"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { useCriarUsuario } from "@/presentation/ui/features/admin/useUsuariosAdmin";
import type { Papel } from "@/presentation/ui/features/admin/types";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const criar = useCriarUsuario();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("operador");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    criar.mutate(
      { nome, email, senha, papel },
      { onSuccess: () => router.push("/admin/usuarios") },
    );
  }

  const mensagemErro =
    criar.error instanceof ErroHttp ? criar.error.message : criar.isError ? "Não foi possível criar o usuário." : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link href="/admin/usuarios" className="text-sm text-muted hover:text-foreground">
        ← Usuários
      </Link>
      <h1 className="text-lg font-semibold text-foreground">Novo usuário</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Senha"
          type="password"
          required
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
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
        {mensagemErro && (
          <p role="alert" className="text-sm text-critical">
            {mensagemErro}
          </p>
        )}
        <Button type="submit" carregando={criar.isPending} className="self-start">
          Criar usuário
        </Button>
      </form>
    </div>
  );
}
