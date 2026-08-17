import { pool } from "@/infra/db/pool";
import { PgUsuarioRepository } from "@/infra/db/repositories/PgUsuarioRepository";
import { PgUsuarioSistemaRepository } from "@/infra/db/repositories/PgUsuarioSistemaRepository";
import { PgProjetoRepository } from "@/infra/db/repositories/PgProjetoRepository";
import { PgConversaRepository } from "@/infra/db/repositories/PgConversaRepository";
import { PgMensagemRepository } from "@/infra/db/repositories/PgMensagemRepository";
import { PgEventoRepository } from "@/infra/db/repositories/PgEventoRepository";
import { PgColunaRepository } from "@/infra/db/repositories/PgColunaRepository";
import { PgIndicadoresRepository } from "@/infra/db/repositories/PgIndicadoresRepository";
import { PgUnitOfWork } from "@/infra/db/repositories/PgUnitOfWork";
import { ArgonHasher } from "@/infra/auth/ArgonHasher";
import { JoseSessionService } from "@/infra/auth/JoseSessionService";
import { SystemClock } from "@/infra/SystemClock";
import { N8nWebhookFinalizarAtendimento } from "@/infra/webhooks/N8nWebhookFinalizarAtendimento";
import { env } from "@/infra/config/env";

import { AutenticarUsuario } from "@/core/application/use-cases/AutenticarUsuario";
import { RegistrarUsuario } from "@/core/application/use-cases/RegistrarUsuario";
import { ObterUsuarioLogado } from "@/core/application/use-cases/ObterUsuarioLogado";
import { ListarColunasDoProjeto } from "@/core/application/use-cases/ListarColunasDoProjeto";
import { ListarConversasDoProjeto } from "@/core/application/use-cases/ListarConversasDoProjeto";
import { ContarConversasPorStatus } from "@/core/application/use-cases/ContarConversasPorStatus";
import { ObterDetalheDaConversa } from "@/core/application/use-cases/ObterDetalheDaConversa";
import { MoverConversaDeStatus } from "@/core/application/use-cases/MoverConversaDeStatus";
import { AssumirConversa } from "@/core/application/use-cases/AssumirConversa";
import { DevolverConversaParaBot } from "@/core/application/use-cases/DevolverConversaParaBot";
import { ConfirmarPagamento } from "@/core/application/use-cases/ConfirmarPagamento";
import { ListarProjetos } from "@/core/application/use-cases/ListarProjetos";
import { CriarProjeto } from "@/core/application/use-cases/CriarProjeto";
import { EditarProjeto } from "@/core/application/use-cases/EditarProjeto";
import { AtivarDesativarProjeto } from "@/core/application/use-cases/AtivarDesativarProjeto";
import { ConcederAcessoAoProjeto } from "@/core/application/use-cases/ConcederAcessoAoProjeto";
import { RevogarAcessoAoProjeto } from "@/core/application/use-cases/RevogarAcessoAoProjeto";
import { ListarUsuarios } from "@/core/application/use-cases/ListarUsuarios";
import { CriarUsuario } from "@/core/application/use-cases/CriarUsuario";
import { EditarUsuario } from "@/core/application/use-cases/EditarUsuario";
import { AtualizarMeuPerfil } from "@/core/application/use-cases/AtualizarMeuPerfil";
import { AlterarMinhaSenha } from "@/core/application/use-cases/AlterarMinhaSenha";
import { RedefinirSenha } from "@/core/application/use-cases/RedefinirSenha";
import { DeletarUsuario } from "@/core/application/use-cases/DeletarUsuario";
import { DeletarProjeto } from "@/core/application/use-cases/DeletarProjeto";
import { ConfigurarColunasDoProjeto } from "@/core/application/use-cases/ConfigurarColunasDoProjeto";
import { ObterIndicadoresDoProjeto } from "@/core/application/use-cases/ObterIndicadoresDoProjeto";

/**
 * Composition root: único lugar que instancia repositórios concretos e monta casos de uso.
 * Route handlers e componentes de servidor importam daqui, nunca `new Pg*Repository()` direto.
 */
function montarContainer() {
  const usuarios = new PgUsuarioRepository(pool);
  const usuarioSistemas = new PgUsuarioSistemaRepository(pool);
  const projetos = new PgProjetoRepository(pool);
  const conversas = new PgConversaRepository(pool);
  const mensagens = new PgMensagemRepository(pool);
  const eventos = new PgEventoRepository(pool);
  const colunas = new PgColunaRepository(pool);
  const indicadores = new PgIndicadoresRepository(pool);
  const unitOfWork = new PgUnitOfWork(pool);

  const hasher = new ArgonHasher();
  const sessoes = new JoseSessionService(env.SESSION_SECRET);
  const clock = new SystemClock();
  const webhookFinalizarAtendimento = new N8nWebhookFinalizarAtendimento(env.N8N_WEBHOOK_FINALIZAR_ATENDIMENTO_URL);

  return {
    sessoes,
    useCases: {
      autenticarUsuario: new AutenticarUsuario(usuarios, usuarioSistemas, hasher, sessoes),
      registrarUsuario: new RegistrarUsuario(usuarios, hasher, sessoes),
      obterUsuarioLogado: new ObterUsuarioLogado(sessoes, usuarios, usuarioSistemas),

      listarColunasDoProjeto: new ListarColunasDoProjeto(colunas),
      listarConversasDoProjeto: new ListarConversasDoProjeto(conversas, clock),
      contarConversasPorStatus: new ContarConversasPorStatus(conversas, clock),
      obterDetalheDaConversa: new ObterDetalheDaConversa(conversas, mensagens, eventos),
      moverConversaDeStatus: new MoverConversaDeStatus(unitOfWork, clock),
      assumirConversa: new AssumirConversa(unitOfWork, clock),
      devolverConversaParaBot: new DevolverConversaParaBot(unitOfWork),
      confirmarPagamento: new ConfirmarPagamento(unitOfWork, clock, webhookFinalizarAtendimento, eventos),

      listarProjetos: new ListarProjetos(projetos, usuarioSistemas),
      criarProjeto: new CriarProjeto(projetos, colunas, usuarioSistemas),
      editarProjeto: new EditarProjeto(projetos),
      ativarDesativarProjeto: new AtivarDesativarProjeto(projetos),
      concederAcessoAoProjeto: new ConcederAcessoAoProjeto(projetos, usuarioSistemas),
      revogarAcessoAoProjeto: new RevogarAcessoAoProjeto(usuarioSistemas),
      listarUsuarios: new ListarUsuarios(usuarios, usuarioSistemas),
      criarUsuario: new CriarUsuario(usuarios, hasher),
      editarUsuario: new EditarUsuario(usuarios, hasher),
      atualizarMeuPerfil: new AtualizarMeuPerfil(usuarios),
      alterarMinhaSenha: new AlterarMinhaSenha(usuarios, hasher),
      redefinirSenha: new RedefinirSenha(usuarios, hasher),
      deletarUsuario: new DeletarUsuario(usuarios),
      deletarProjeto: new DeletarProjeto(projetos),
      configurarColunasDoProjeto: new ConfigurarColunasDoProjeto(colunas),
      obterIndicadoresDoProjeto: new ObterIndicadoresDoProjeto(indicadores, clock),
    },
  };
}

let containerSingleton: ReturnType<typeof montarContainer> | undefined;

export function container(): ReturnType<typeof montarContainer> {
  containerSingleton ??= montarContainer();
  return containerSingleton;
}
