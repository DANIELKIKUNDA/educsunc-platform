import { EntreeChronologieNotification, GranulariteChronologie } from '../../domain';
import { RegistreNotificationsMemoire } from '../persistence';
import { LigneChronologieTechniqueNotification } from './TypesChronologieNotification';

// Ce fichier encapsule le stockage technique append-only de la chronology Notifications.

/** Cette classe centralise l'ecriture et la lecture brute de la chronology en memoire. */
export class StockageChronologieNotification {
  /** Ce constructeur relie le stockage au registre memoire partage. */
  constructor(private readonly registreNotificationsMemoire: RegistreNotificationsMemoire) {}

  /** Cette methode ajoute une entree append-only a la chronology d'une notification. */
  public async ajouterEntree(
    identifiantNotification: string,
    entree: EntreeChronologieNotification,
    granularite: GranulariteChronologie = 'FORENSIC',
    appendOnly = true,
  ): Promise<void> {
    const chronologie = this.registreNotificationsMemoire.chronologies.get(identifiantNotification) ?? [];
    chronologie.push(entree);
    this.registreNotificationsMemoire.chronologies.set(identifiantNotification, chronologie);

    const projection = this.registreNotificationsMemoire.projectionsChronologie.get(identifiantNotification) ?? [];
    projection.push(this.convertirVersLigneTechnique(identifiantNotification, entree, granularite, appendOnly));
    this.registreNotificationsMemoire.projectionsChronologie.set(identifiantNotification, projection);
  }

  /** Cette methode retourne la chronology brute d'une notification. */
  public async lireEntrees(identifiantNotification: string): Promise<EntreeChronologieNotification[]> {
    return [...(this.registreNotificationsMemoire.chronologies.get(identifiantNotification) ?? [])];
  }

  /** Cette methode retourne la projection technique de chronology. */
  public async lireProjection(identifiantNotification: string): Promise<LigneChronologieTechniqueNotification[]> {
    return [...(this.registreNotificationsMemoire.projectionsChronologie.get(identifiantNotification) ?? [])];
  }

  /** Cette methode remplace la projection technique apres reconstruction. */
  public async remplacerProjection(
    identifiantNotification: string,
    lignes: readonly LigneChronologieTechniqueNotification[],
  ): Promise<void> {
    this.registreNotificationsMemoire.projectionsChronologie.set(identifiantNotification, [...lignes]);
  }

  /** Cette methode convertit une entree domaine en ligne technique de chronology. */
  private convertirVersLigneTechnique(
    identifiantNotification: string,
    entree: EntreeChronologieNotification,
    granularite: GranulariteChronologie,
    appendOnly: boolean,
  ): LigneChronologieTechniqueNotification {
    return {
      identifiant: entree.obtenirId(),
      identifiantNotification,
      typeEvenement: entree.obtenirTypeEvenement(),
      statutAvant: entree.statutAvant,
      statutApres: entree.obtenirStatutApres(),
      correlationId: entree.correlationId,
      requestId: entree.requestId,
      acteur: entree.acteur,
      horodatage: entree.obtenirHorodatage(),
      granularite,
      appendOnly,
      metadonnees: { ...entree.metadonnees, ...entree.metadonneesForensic },
    };
  }
}
