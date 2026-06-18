import { randomUUID } from 'node:crypto';
import {
  ContexteObservabiliteNotification,
  EntreeJournalObservabiliteNotification,
} from './TypesObservabiliteNotifications';

// Ce fichier conserve un journal d'observabilite du moteur Notifications.

/** Cette classe centralise les messages d'observabilite corrélés du moteur. */
export class JournalObservabiliteNotifications {
  private readonly entrees: EntreeJournalObservabiliteNotification[] = [];

  /** Ce constructeur fixe une retention memoire simple des entrees de journal. */
  constructor(private readonly retentionMaximale = 500) {}

  /** Cette methode ajoute une entree de journal corrélée. */
  public journaliser(
    niveau: EntreeJournalObservabiliteNotification['niveau'],
    message: string,
    contexte: ContexteObservabiliteNotification,
  ): EntreeJournalObservabiliteNotification {
    const entree: EntreeJournalObservabiliteNotification = {
      identifiant: randomUUID(),
      niveau,
      message,
      horodatage: new Date(),
      contexte: {
        ...contexte,
        metadata: { ...contexte.metadata },
      },
    };
    this.entrees.push(entree);

    if (this.entrees.length > this.retentionMaximale) {
      this.entrees.splice(0, this.entrees.length - this.retentionMaximale);
    }

    return entree;
  }

  /** Cette methode retourne les entrees les plus recentes du journal. */
  public lireRecentes(limite = 100): EntreeJournalObservabiliteNotification[] {
    return this.entrees.slice(-limite);
  }
}
