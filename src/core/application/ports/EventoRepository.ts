import type { EventoDominio } from "@/core/domain/Conversa";

export interface Evento {
  id: number;
  conversaId: number;
  tipo: string;
  detalhes: Record<string, unknown>;
  criadoEm: Date;
}

export interface EventoRepository {
  listarPorConversa(conversaId: number): Promise<Evento[]>;
  registrar(conversaId: number, evento: EventoDominio): Promise<void>;
}
