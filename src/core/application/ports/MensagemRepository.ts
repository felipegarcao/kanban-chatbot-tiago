export interface Mensagem {
  id: number;
  conversaId: number;
  autor: "contato" | "bot" | "humano";
  conteudo: string | null;
  criadoEm: Date;
}

export interface MensagemRepository {
  listarUltimasPorConversa(conversaId: number, limite: number): Promise<Mensagem[]>;
}
