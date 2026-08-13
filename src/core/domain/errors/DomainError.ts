export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ConversaNaoEncontrada extends DomainError {
  readonly code = "CONVERSA_NAO_ENCONTRADA";

  constructor(conversaId: number) {
    super(`Conversa ${conversaId} não encontrada.`);
  }
}

export class UsuarioNaoEncontrado extends DomainError {
  readonly code = "USUARIO_NAO_ENCONTRADO";

  constructor(identificador: string | number) {
    super(`Usuário ${identificador} não encontrado.`);
  }
}

export class ProjetoNaoEncontrado extends DomainError {
  readonly code = "PROJETO_NAO_ENCONTRADO";

  constructor(sistemaId: number) {
    super(`Projeto ${sistemaId} não encontrado.`);
  }
}

export class SemPermissaoNoProjeto extends DomainError {
  readonly code = "SEM_PERMISSAO_NO_PROJETO";

  constructor(sistemaId: number) {
    super(`Usuário não tem permissão no projeto ${sistemaId}.`);
  }
}

export class TransicaoDeStatusInvalida extends DomainError {
  readonly code = "TRANSICAO_DE_STATUS_INVALIDA";

  constructor(de: string, para: string) {
    super(`Não é possível mover uma conversa de "${de}" para "${para}".`);
  }
}

export class CredenciaisInvalidas extends DomainError {
  readonly code = "CREDENCIAIS_INVALIDAS";

  constructor() {
    super("Email ou senha inválidos.");
  }
}

export class UsuarioInativo extends DomainError {
  readonly code = "USUARIO_INATIVO";

  constructor() {
    super("Usuário inativo.");
  }
}

export class EmailJaCadastrado extends DomainError {
  readonly code = "EMAIL_JA_CADASTRADO";

  constructor(email: string) {
    super(`Já existe um usuário com o email ${email}.`);
  }
}

export class PermissaoDeAdminNecessaria extends DomainError {
  readonly code = "PERMISSAO_DE_ADMIN_NECESSARIA";

  constructor() {
    super("Esta ação exige o papel de administrador.");
  }
}

export class ConflitoDeConcorrencia extends DomainError {
  readonly code = "CONFLITO_DE_CONCORRENCIA";

  constructor(mensagem = "A conversa foi alterada por outro processo. Recarregue e tente novamente.") {
    super(mensagem);
  }
}

export class ProjetoPossuiConversas extends DomainError {
  readonly code = "PROJETO_POSSUI_CONVERSAS";

  constructor() {
    super("Este projeto tem conversas associadas e não pode ser excluído. Desative-o em vez disso.");
  }
}

export class NaoPodeExcluirProprioUsuario extends DomainError {
  readonly code = "NAO_PODE_EXCLUIR_PROPRIO_USUARIO";

  constructor() {
    super("Você não pode excluir sua própria conta.");
  }
}

export class NaoPodeExcluirUltimoAdmin extends DomainError {
  readonly code = "NAO_PODE_EXCLUIR_ULTIMO_ADMIN";

  constructor() {
    super("Não é possível excluir o último administrador ativo.");
  }
}
