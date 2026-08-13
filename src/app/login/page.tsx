"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { useLogin } from "@/presentation/ui/features/auth/useLogin";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    login.mutate(
      { email, senha },
      {
        onSuccess: () => {
          router.replace(searchParams.get("redirect") || "/app");
        },
      },
    );
  }

  const mensagemErro =
    login.error instanceof ErroHttp
      ? login.error.codigo === "MUITAS_TENTATIVAS"
        ? login.error.message
        : "Email ou senha inválidos."
      : login.isError
        ? "Não foi possível entrar. Tente novamente."
        : null;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">Painel de Conversas</h1>
        <p className="mt-1 text-sm text-muted">Entre com sua conta para continuar.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Senha"
            type="password"
            name="senha"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {mensagemErro && (
            <p role="alert" className="text-sm text-critical">
              {mensagemErro}
            </p>
          )}

          <Button type="submit" carregando={login.isPending} className="mt-2 w-full">
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
