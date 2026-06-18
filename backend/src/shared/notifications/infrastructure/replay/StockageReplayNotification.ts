import { randomUUID } from 'node:crypto';
import { EntreeReplayNotification } from './TypesReplayNotification';

// Ce fichier heberge le stockage technique du rejeu Notifications.

/** Cette classe centralise l'historique technique des rejeux du moteur Notifications. */
export class StockageReplayNotification {
  private readonly historiquesParNotification = new Map<string, EntreeReplayNotification[]>();

  /** Cette methode ouvre une nouvelle entree de rejeu technique. */
  public ouvrir(
    identifiantNotification: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): EntreeReplayNotification {
    const entree: EntreeReplayNotification = {
      identifiantReplay: randomUUID(),
      identifiantNotification,
      correlationId: metadata.correlationId as string | undefined,
      requestId: metadata.requestId as string | undefined,
      raison: metadata.raison as string | undefined,
      acteur: metadata.acteurId as string | undefined,
      rebatirChronologie: Boolean(metadata.rebatirChronologie),
      autoriserRenduCanal: Boolean(metadata.autoriserRenduCanal),
      demarreLe: new Date(),
      succes: false,
      metadata: { ...metadata },
    };

    const historique = this.historiquesParNotification.get(identifiantNotification) ?? [];
    historique.push(entree);
    this.historiquesParNotification.set(identifiantNotification, historique);

    return entree;
  }

  /** Cette methode cloture une entree de rejeu avec son resultat final. */
  public terminer(
    identifiantNotification: string,
    identifiantReplay: string,
    succes: boolean,
    erreur?: string,
  ): EntreeReplayNotification | null {
    const historique = this.historiquesParNotification.get(identifiantNotification) ?? [];
    const index = historique.findIndex((element) => element.identifiantReplay === identifiantReplay);
    if (index < 0) {
      return null;
    }

    const precedente = historique[index];
    const miseAJour: EntreeReplayNotification = {
      ...precedente,
      succes,
      erreur,
      termineLe: new Date(),
    };
    historique[index] = miseAJour;
    this.historiquesParNotification.set(identifiantNotification, historique);
    return miseAJour;
  }

  /** Cette methode retourne l'historique de rejeu d'une notification. */
  public lireHistorique(identifiantNotification: string): EntreeReplayNotification[] {
    return [...(this.historiquesParNotification.get(identifiantNotification) ?? [])];
  }
}
