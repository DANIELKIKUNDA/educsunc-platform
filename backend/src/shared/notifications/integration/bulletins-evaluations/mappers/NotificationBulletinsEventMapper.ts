import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import { MappeurEvenementVersIntentionNotification } from '../../../application/mappers';
import type { DtoCommandeCreationNotification } from '../../../application/dto';

// Ce fichier traduit les evenements du BC bulletins-evaluations vers les DTO stables de Notifications.

/** Cette classe convertit les faits pedagogiques en intentions de notification serialisables. */
export class NotificationBulletinsEventMapper {
  /** Cette methode fabrique une intention DTO a partir d'un bloc brut deja normalise. */
  public static convertirDepuisBloc(
    bloc: Readonly<Record<string, unknown>>,
  ): DtoCommandeCreationNotification {
    return MappeurEvenementVersIntentionNotification.convertir(bloc);
  }

  /** Cette methode expose une reference metier commune aux evenements pedagogiques connus. */
  public static extraireReferenceMetier(evenement: EvenementDomaine): string | undefined {
    if ('idBulletinEleve' in evenement && typeof evenement.idBulletinEleve === 'string') {
      return evenement.idBulletinEleve;
    }
    if ('idProclamationClasse' in evenement && typeof evenement.idProclamationClasse === 'string') {
      return evenement.idProclamationClasse;
    }
    if ('idFicheCotationEleveCours' in evenement && typeof evenement.idFicheCotationEleveCours === 'string') {
      return evenement.idFicheCotationEleveCours;
    }
    if (
      'idDiagnosticTechniqueAcademique' in evenement &&
      typeof evenement.idDiagnosticTechniqueAcademique === 'string'
    ) {
      return evenement.idDiagnosticTechniqueAcademique;
    }
    if ('idEleve' in evenement && typeof evenement.idEleve === 'string') {
      return evenement.idEleve;
    }
    return undefined;
  }
}
