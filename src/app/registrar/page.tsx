"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { useRegistro } from "@/presentation/ui/features/auth/useRegistro";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function RegistrarPage() {
  const router = useRouter();
  const registro = useRegistro();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha;

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    if (senhasDiferentes) return;
    registro.mutate(
      { nome, email, senha },
      { onSuccess: () => router.replace("/app") },
    );
  }

  const mensagemErro =
    registro.error instanceof ErroHttp
      ? registro.error.codigo === "EMAIL_JA_CADASTRADO"
        ? "Já existe uma conta com esse email."
        : registro.error.codigo === "MUITAS_TENTATIVAS"
          ? registro.error.message
          : registro.error.message
      : registro.isError
        ? "Não foi possível criar a conta. Tente novamente."
        : null;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
            P
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Criar conta</h1>
            <p className="text-sm text-muted">Painel de Conversas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Field label="Nome" name="nome" icone={User} required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field
            label="Email"
            type="email"
            name="email"
            icone={Mail}
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Senha"
            type="password"
            name="senha"
            icone={Lock}
            autoComplete="new-password"
            minLength={8}
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Field
            label="Confirmar senha"
            type="password"
            name="confirmarSenha"
            icone={Lock}
            autoComplete="new-password"
            required
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            erro={senhasDiferentes ? "As senhas não coincidem." : undefined}
          />

          {mensagemErro && (
            <p role="alert" className="text-sm text-critical">
              {mensagemErro}
            </p>
          )}

          <Button type="submit" icone={UserPlus} carregando={registro.isPending} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-accent/10 p-2.5 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          Sua conta é criada na hora, mas você só verá conversas depois que um administrador vincular um projeto a
          ela.
        </p>

        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
