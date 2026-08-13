import * as argon2 from "argon2";
import type { Hasher } from "@/core/application/ports/Hasher";

export class ArgonHasher implements Hasher {
  async hash(senha: string): Promise<string> {
    return argon2.hash(senha, { type: argon2.argon2id });
  }

  async verificar(senha: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, senha);
    } catch {
      return false;
    }
  }
}
