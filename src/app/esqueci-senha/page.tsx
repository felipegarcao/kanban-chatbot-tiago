"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { useRedefinirSenha } from "@/presentation/ui/features/auth/useRedefinirSenha";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const redefinir = useRedefinirSenha();
  const [etapa, setEtapa] = useState<"email" | "senha">("email");
  const [email, setEmail] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const senhasDiferentes = confirmarSenha.length > 0 && senhaNova !== confirmarSenha;

  function handleAvancar(evento: FormEvent) {
    evento.preventDefault();
    setEtapa("senha");
  }

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    if (senhasDiferentes) return;
    redefinir.mutate(
      { email, senhaNova, confirmarSenha },
      {
        onSuccess: () => {
          setSucesso(true);
          setTimeout(() => router.replace("/login"), 2000);
        },
      },
    );
  }

  const mensagemErro =
    redefinir.error instanceof ErroHttp
      ? redefinir.error.codigo === "USUARIO_NAO_ENCONTRADO"
        ? "Não encontramos uma conta com esse email."
        : redefinir.error.message
      : redefinir.isError
        ? "Não foi possível redefinir a senha. Tente novamente."
        : null;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
            P
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Esqueci minha senha</h1>
            <p className="text-sm text-muted">
              {sucesso ? "Tudo pronto." : etapa === "email" ? "Informe o email da sua conta." : "Defina a nova senha."}
            </p>
          </div>
        </div>

        {sucesso ? (
          <p role="status" className="mt-6 text-sm text-success">
            Senha redefinida com sucesso. Redirecionando para o login…
          </p>
        ) : etapa === "email" ? (
          <form onSubmit={handleAvancar} className="mt-6 flex flex-col gap-4" noValidate>
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
            <Button type="submit" icone={ArrowRight} className="mt-2 w-full">
              Continuar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Field
              label="Nova senha"
              type="password"
              name="senhaNova"
              icone={KeyRound}
              autoComplete="new-password"
              minLength={8}
              required
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
            />
            <Field
              label="Confirmar nova senha"
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

            <div className="mt-2 flex gap-2">
              <Button type="button" variante="secondary" onClick={() => setEtapa("email")} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" icone={KeyRound} carregando={redefinir.isPending} className="flex-1">
                Redefinir
              </Button>
            </div>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
