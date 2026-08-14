import { UsuarioInativo } from "./errors/DomainError";

export type Papel = "admin" | "operador";

export interface UsuarioProps {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: Date;
}

export class Usuario {
  private constructor(private props: UsuarioProps) {}

  static reconstituir(props: UsuarioProps): Usuario {
    return new Usuario({ ...props });
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get senhaHash(): string {
    return this.props.senhaHash;
  }

  get papel(): Papel {
    return this.props.papel;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  isAdmin(): boolean {
    return this.props.papel === "admin";
  }

  garantirAtivo(): void {
    if (!this.props.ativo) {
      throw new UsuarioInativo();
    }
  }

  renomear(nome: string): void {
    this.props.nome = nome;
  }

  alterarEmail(email: string): void {
    this.props.email = email;
  }

  redefinirSenha(senhaHash: string): void {
    this.props.senhaHash = senhaHash;
  }

  redefinirPapel(papel: Papel): void {
    this.props.papel = papel;
  }

  ativar(): void {
    this.props.ativo = true;
  }

  desativar(): void {
    this.props.ativo = false;
  }

  toProps(): Readonly<UsuarioProps> {
    return { ...this.props };
  }
}
