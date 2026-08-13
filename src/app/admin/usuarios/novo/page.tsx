"use client";

import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { FormCard } from "@/presentation/ui/components/FormCard";
import { Select } from "@/presentation/ui/components/Select";
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
    <FormCard titulo="Novo usuário" descricao="Crie um acesso para um admin ou operador." voltarHref="/admin/usuarios" voltarRotulo="Usuários">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome" required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Senha"
          type="password"
          required
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Select label="Papel" value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </Select>
        {mensagemErro && (
          <p role="alert" className="text-sm text-critical">
            {mensagemErro}
          </p>
        )}
        <Button type="submit" icone={UserPlus} carregando={criar.isPending} className="self-start">
          Criar usuário
        </Button>
      </form>
    </FormCard>
  );
}
