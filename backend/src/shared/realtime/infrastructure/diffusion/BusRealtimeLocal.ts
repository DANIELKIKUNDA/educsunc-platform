import type { MessageTempsReel } from '../../domain';
import { JournalDiffusionRealtime } from './JournalDiffusionRealtime';

export class BusRealtimeLocal {
  private readonly journal = new JournalDiffusionRealtime();

  public publier(message: MessageTempsReel, destinataires: readonly string[]): void {
    this.journal.enregistrer({
      type: message.type,
      canal: message.canal.nom,
      destinataires,
      emittedAt: message.contexte.emittedAt,
    });
  }

  public lireJournal() {
    return this.journal.lire();
  }
}
