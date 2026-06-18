// Ce fichier declare la recuperation technique du stockage du moteur Notifications.

import { GestionCycleVieStockageNotifications } from '../storage';
import { OperationRecuperationNotification } from './TypesRecuperationNotifications';

/** Cette classe observe et valide la coherence minimale des stockages Notifications. */
export class RecuperationStockageNotifications {
  /** Ce constructeur relie la recuperation au cycle de vie de stockage. */
  constructor(
    private readonly gestionCycleVieStockageNotifications: GestionCycleVieStockageNotifications,
  ) {}

  /** Cette methode controle le snapshot global de stockage et retourne un resultat technique. */
  public verifierCoherence(): OperationRecuperationNotification {
    const snapshot = this.gestionCycleVieStockageNotifications.observer();
    const total = snapshot.totalActives + snapshot.totalArchivees + snapshot.totalForensic + snapshot.totalReplay;

    return {
      cible: 'STORAGE',
      succes: total >= 0,
      recupereLe: new Date(),
      elementsTraites: total,
      metadata: {
        totalActives: snapshot.totalActives,
        totalArchivees: snapshot.totalArchivees,
        totalForensic: snapshot.totalForensic,
        totalReplay: snapshot.totalReplay,
      },
    };
  }
}
