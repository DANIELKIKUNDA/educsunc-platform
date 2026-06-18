import type { MessageTempsReel } from '../../domain';
import type { PortDiffusionRealtime } from '../../application';
import { BusRealtimeLocal } from './BusRealtimeLocal';

export class DiffuseurRealtimeMemoire implements PortDiffusionRealtime {
  private readonly bus = new BusRealtimeLocal();

  public async diffuser(message: MessageTempsReel, destinataires: readonly string[]): Promise<void> {
    this.bus.publier(message, destinataires);
  }

  public lireJournal() {
    return this.bus.lireJournal();
  }
}
