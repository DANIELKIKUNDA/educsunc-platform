import { ChronologieNotification, EntreeChronologieNotification } from '../../domain';
import { StockageChronologieNotification } from './StockageChronologieNotification';
import {
  LigneChronologieTechniqueNotification,
  ResultatReconstructionChronologieNotification,
} from './TypesChronologieNotification';

// Ce fichier reconstruit la chronology technique a partir de la timeline domaine.

/** Cette classe rebatit une chronology coherente et ordonnee pour forensic et replay. */
export class ReconstruteurChronologieNotification {
  /** Ce constructeur relie le reconstruteur au stockage technique de chronology. */
  constructor(private readonly stockageChronologieNotification: StockageChronologieNotification) {}

  /** Cette methode reconstruit la projection technique complete d'une notification. */
  public async reconstruire(
    identifiantNotification: string,
    chronologie: ChronologieNotification,
    entrees: readonly EntreeChronologieNotification[],
  ): Promise<ResultatReconstructionChronologieNotification> {
    const lignesReconstruites = [...entrees]
      .sort((gauche, droite) => gauche.obtenirHorodatage().getTime() - droite.obtenirHorodatage().getTime())
      .map<LigneChronologieTechniqueNotification>((entree) => ({
        identifiant: entree.obtenirId(),
        identifiantNotification,
        typeEvenement: entree.obtenirTypeEvenement(),
        statutAvant: entree.statutAvant,
        statutApres: entree.obtenirStatutApres(),
        correlationId: entree.correlationId ?? chronologie.obtenirCorrelationId(),
        requestId: entree.requestId ?? chronologie.obtenirRequestId(),
        acteur: entree.acteur,
        horodatage: entree.obtenirHorodatage(),
        granularite: chronologie.obtenirGranularite(),
        appendOnly: chronologie.estAppendOnly(),
        metadonnees: { ...entree.metadonnees, ...entree.metadonneesForensic },
      }));

    await this.stockageChronologieNotification.remplacerProjection(
      identifiantNotification,
      lignesReconstruites,
    );

    return {
      identifiantNotification,
      totalEntrees: lignesReconstruites.length,
      correlationId: chronologie.obtenirCorrelationId(),
      requestId: chronologie.obtenirRequestId(),
      granularite: chronologie.obtenirGranularite(),
      reconstruiteLe: new Date(),
    };
  }
}
