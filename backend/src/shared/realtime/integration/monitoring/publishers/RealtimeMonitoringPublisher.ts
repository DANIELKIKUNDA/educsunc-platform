import type { PublierEvenementTempsReelCommand } from '../../../application';

export type RealtimeMonitoringSink = (commande: PublierEvenementTempsReelCommand) => Promise<void>;

export class RealtimeMonitoringPublisher {
  private readonly messages: PublierEvenementTempsReelCommand[] = [];

  constructor(private readonly sink?: RealtimeMonitoringSink) {}

  public async publier(commande: PublierEvenementTempsReelCommand): Promise<void> {
    // Le journal borne permet diagnostic/test sans devenir une seconde infrastructure de transport.
    this.messages.push(commande);
    if (this.messages.length > 200) this.messages.splice(0, this.messages.length - 200);
    if (this.sink) await this.sink(commande);
  }

  public journal(): readonly PublierEvenementTempsReelCommand[] {
    return [...this.messages];
  }
}
