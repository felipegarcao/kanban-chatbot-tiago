"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, Save } from "lucide-react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { FormCard } from "@/presentation/ui/components/FormCard";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";
import { useAlterarSenha, useAtualizarPerfil } from "@/presentation/ui/features/auth/usePerfil";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";
import type { UsuarioSessao } from "@/presentation/ui/features/auth/types";

export default function PerfilPage() {
  const usuarioLogado = useUsuarioLogado();

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <FormCard titulo="Meu perfil" voltarHref="/app" voltarRotulo="Conversas" rodape={<AlterarSenhaForm />}>
        {usuarioLogado.data && <EditarPerfilForm usuario={usuarioLogado.data} />}
      </FormCard>
    </div>
  );
}

function EditarPerfilForm({ usuario }: { usuario: UsuarioSessao }) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [sucesso, setSucesso] = useState(false);
  const atualizar = useAtualizarPerfil();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSucesso(false);
    atualizar.mutate({ nome, email }, { onSuccess: () => setSucesso(true) });
  }

  const mensagemErro =
    atualizar.error instanceof ErroHttp
      ? atualizar.error.message
      : atualizar.error
        ? "Não foi possível salvar o perfil."
        : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" required value={nome} onChange={(e) => { setNome(e.target.value); setSucesso(false); }} />
      <Field
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setSucesso(false); }}
      />
      {mensagemErro && (
        <p role="alert" className="text-sm text-critical">
          {mensagemErro}
        </p>
      )}
      {sucesso && !atualizar.isPending && (
        <p role="status" className="text-sm text-success">
          Perfil atualizado.
        </p>
      )}
      <Button type="submit" icone={Save} carregando={atualizar.isPending} className="self-start">
        Salvar alterações
      </Button>
    </form>
  );
}

function AlterarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const alterar = useAlterarSenha();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSucesso(false);
    setErroValidacao(null);

    if (senhaNova !== confirmarSenha) {
      setErroValidacao("As senhas não coincidem.");
      return;
    }

    alterar.mutate(
      { senhaAtual, senhaNova },
      {
        onSuccess: () => {
          setSucesso(true);
          setSenhaAtual("");
          setSenhaNova("");
          setConfirmarSenha("");
        },
      },
    );
  }

  const mensagemErro =
    erroValidacao ??
    (alterar.error instanceof ErroHttp
      ? alterar.error.message
      : alterar.error
        ? "Não foi possível alterar a senha."
        : null);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-foreground">Alterar senha</p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
        <Field
          label="Senha atual"
          type="password"
          icone={KeyRound}
          required
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
        <Field
          label="Nova senha"
          type="password"
          icone={KeyRound}
          required
          minLength={8}
          value={senhaNova}
          onChange={(e) => setSenhaNova(e.target.value)}
        />
        <Field
          label="Confirmar nova senha"
          type="password"
          icone={KeyRound}
          required
          minLength={8}
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />
        {mensagemErro && (
          <p role="alert" className="text-sm text-critical">
            {mensagemErro}
          </p>
        )}
        {sucesso && !alterar.isPending && (
          <p role="status" className="text-sm text-success">
            Senha alterada.
          </p>
        )}
        <Button type="submit" icone={Save} carregando={alterar.isPending} className="self-start">
          Alterar senha
        </Button>
      </form>
    </div>
  );
}
