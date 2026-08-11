import { randomUUID } from 'node:crypto';
import type {
  AuditOutboxDeliveryResult,
  AuditOutboxDeliveryService,
} from '../../application/services/AuditOutboxDeliveryService';

export class AuditOutboxWorker {
  private timer?: NodeJS.Timeout;
  private running = false;
  private readonly workerId = `audit-outbox-${randomUUID()}`;

  public constructor(
    private readonly delivery: AuditOutboxDeliveryService,
    private readonly intervalMs = 2_000,
    private readonly onError: (error: unknown) => void = () => undefined,
  ) {}

  public start(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    this.timer.unref();
  }

  public async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    while (this.running) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 10);
      });
    }
  }

  public async runOnce(): Promise<AuditOutboxDeliveryResult> {
    return this.delivery.traiterLot(this.workerId);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.runOnce();
    } catch (error) {
      this.onError(error);
    } finally {
      this.running = false;
    }
  }
}
