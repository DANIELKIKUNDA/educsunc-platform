import { DestinataireNotification } from '../entites';
import { PolitiqueSecuriteContenu } from '../politiques';
import { ContenuNotification, InformationsRetry } from '../objets-valeur';
import { StatutNotification } from '../enumerations';
import { GRAPH_STATUTS_NOTIFICATION } from '../constantes';

/** Cette specification porte les transitions de statut autorisees. */
export class SpecificationTransitionNotification {
  /** Cette methode indique si une transition est autorisee par la machine officielle. */
  public static estAutorisee(statutActuel: StatutNotification, statutCible: StatutNotification): boolean {
    return GRAPH_STATUTS_NOTIFICATION[statutActuel].includes(statutCible);
  }
}

/** Cette specification porte les regles d'autorisation du retry. */
export class SpecificationRetryNotification {
  /** Cette methode applique les regles minimales de retry autorise. */
  public static estAutorise(statut: StatutNotification, informationsRetry: InformationsRetry, expiree: boolean): boolean {
    if (expiree) {
      return false;
    }
    if (['CANCELLED', 'ARCHIVED', 'EXPIRED'].includes(statut)) {
      return false;
    }
    return informationsRetry.obtenirCompteurRetry() < informationsRetry.obtenirMaximumRetry();
  }
}

/** Cette specification porte les regles d'isolation d'audience. */
export class SpecificationAudienceNotification {
  /** Cette methode verifie qu'aucun destinataire ne sort du tenant attendu. */
  public static respecteIsolationTenant(
    organisationId: string | undefined,
    ecoleId: string | undefined,
    destinataires: readonly DestinataireNotification[],
  ): boolean {
    return destinataires.every((destinataire) => {
      if (organisationId && destinataire.obtenirOrganisationId() !== organisationId) {
        return false;
      }
      if (ecoleId && destinataire.obtenirEcoleId() && destinataire.obtenirEcoleId() !== ecoleId) {
        return false;
      }
      return true;
    });
  }
}

/** Cette specification porte les regles de securite du contenu rendu. */
export class SpecificationSecuriteContenuNotification {
  /** Cette methode verifie qu'aucun token interdit n'est transporte par le contenu. */
  public static estValide(contenu: ContenuNotification, politique: PolitiqueSecuriteContenu): boolean {
    const serialise = JSON.stringify({
      message: contenu.obtenirMessage(),
      placeholders: contenu.obtenirPlaceholders(),
      snapshot: contenu.obtenirSnapshotRendu(),
    }).toLowerCase();

    return politique.obtenirTokensInterdits().every((token) => !serialise.includes(token.toLowerCase()));
  }
}
