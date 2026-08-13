import type { Clock } from "@/core/application/ports/Clock";

export class SystemClock implements Clock {
  agora(): Date {
    return new Date();
  }
}
