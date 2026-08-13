export interface ProjetoProps {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: Date;
}

export class Projeto {
  private constructor(private props: ProjetoProps) {}

  static reconstituir(props: ProjetoProps): Projeto {
    return new Projeto({ ...props });
  }

  static criar(props: { nome: string; descricao: string | null }): Omit<ProjetoProps, "id"> {
    return {
      nome: props.nome,
      descricao: props.descricao,
      ativo: true,
      criadoEm: new Date(),
    };
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string | null {
    return this.props.descricao;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  ativar(): void {
    this.props.ativo = true;
  }

  desativar(): void {
    this.props.ativo = false;
  }

  renomear(nome: string, descricao: string | null): void {
    this.props.nome = nome;
    this.props.descricao = descricao;
  }

  toProps(): Readonly<ProjetoProps> {
    return { ...this.props };
  }
}
