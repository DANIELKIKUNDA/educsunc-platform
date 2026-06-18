import { MappeurEvenementVersIntentionNotification } from '../../../application/mappers';
import type { DtoCommandeCreationNotification } from '../../../application/dto';
import type { NotificationScolariteEvenementLike } from '../NotificationsScolariteIntegrationTypes';

// Ce fichier traduit les evenements du BC scolarite-eleves vers les DTO stables de Notifications.

/** Cette classe convertit les faits de scolarite en intentions de notification serialisables. */
export class NotificationScolariteEventMapper {
  /** Cette methode fabrique une intention DTO a partir d'un bloc brut deja normalise. */
  public static convertirDepuisBloc(
    bloc: Readonly<Record<string, unknown>>,
  ): DtoCommandeCreationNotification {
    return MappeurEvenementVersIntentionNotification.convertir(bloc);
  }

  /** Cette methode expose une reference metier commune aux evenements de scolarite connus. */
  public static extraireReferenceMetier(
    evenement: NotificationScolariteEvenementLike,
  ): string | undefined {
    return 'referenceMetier' in evenement && typeof evenement.referenceMetier === 'string'
      ? evenement.referenceMetier
      : undefined;
  }
}
