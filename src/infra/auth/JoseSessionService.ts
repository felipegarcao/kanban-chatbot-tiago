import { jwtVerify, SignJWT } from "jose";
import type { SessaoPayload, SessionService } from "@/core/application/ports/SessionService";
import type { Papel } from "@/core/domain/Usuario";

const DURACAO_SESSAO = "2h";

export class JoseSessionService implements SessionService {
  private readonly chave: Uint8Array;

  constructor(segredo: string) {
    this.chave = new TextEncoder().encode(segredo);
  }

  async criar(payload: SessaoPayload): Promise<string> {
    return new SignJWT({ usuarioId: payload.usuarioId, papel: payload.papel })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(DURACAO_SESSAO)
      .sign(this.chave);
  }

  async verificar(token: string): Promise<SessaoPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.chave);
      if (typeof payload.usuarioId !== "number" || typeof payload.papel !== "string") {
        return null;
      }
      return { usuarioId: payload.usuarioId, papel: payload.papel as Papel };
    } catch {
      return null;
    }
  }
}
