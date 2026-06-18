import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import { MappeurEvenementVersIntentionNotification } from '../../../application/mappers';
import type { DtoCommandeCreationNotification } from '../../../application/dto';
import type { NotificationPaiementsEvenementLike } from '../NotificationsPaiementsIntegrationTypes';

// Ce fichier traduit les evenements du BC paiements-facturation vers les DTO stables de Notifications.

/** Cette classe convertit les faits financiers en intentions de notification serialisables. */
export class NotificationPaiementsEventMapper {
  /** Cette methode fabrique une intention DTO a partir d'un bloc brut deja normalise. */
  public static convertirDepuisBloc(
    bloc: Readonly<Record<string, unknown>>,
  ): DtoCommandeCreationNotification {
    return MappeurEvenementVersIntentionNotification.convertir(bloc);
  }

  /** Cette methode expose une reference metier commune aux evenements financiers connus. */
  public static extraireReferenceMetier(
    evenement: EvenementDomaine | NotificationPaiementsEvenementLike,
  ): string | undefined {
    if ('idPaiement' in evenement && typeof evenement.idPaiement === 'string') {
      return evenement.idPaiement;
    }
    if ('idObligation' in evenement && typeof evenement.idObligation === 'string') {
      return evenement.idObligation;
    }
    if ('idRestitution' in evenement && typeof evenement.idRestitution === 'string') {
      return evenement.idRestitution;
    }
    if ('idEleve' in evenement && typeof evenement.idEleve === 'string') {
      return evenement.idEleve;
    }
    return undefined;
  }
}
