import type { EvenementDomaine } from '../../../../../shared/domain/DomainEvent';
import { MappeurEvenementVersIntentionNotification } from '../../../application/mappers';
import type { DtoCommandeCreationNotification } from '../../../application/dto';

// Ce fichier traduit les evenements du BC referentiel-academique vers les DTO stables de Notifications.

/** Cette classe convertit les faits de referentiel en intentions de notification serialisables. */
export class NotificationReferentielEventMapper {
  /** Cette methode fabrique une intention DTO a partir d'un bloc brut deja normalise. */
  public static convertirDepuisBloc(
    bloc: Readonly<Record<string, unknown>>,
  ): DtoCommandeCreationNotification {
    return MappeurEvenementVersIntentionNotification.convertir(bloc);
  }

  /** Cette methode expose une reference metier commune aux evenements de referentiel connus. */
  public static extraireReferenceMetier(evenement: EvenementDomaine): string | undefined {
    const nomsMethodes = [
      'obtenirIdVersionReferentielProgramme',
      'obtenirIdProgrammeNiveau',
      'obtenirIdCalendrierAcademique',
      'obtenirIdAnneeScolaire',
      'obtenirIdOrganisation',
      'obtenirIdEcole',
      'obtenirIdClassePedagogique',
      'obtenirIdClasseAcademique',
      'obtenirIdSectionScolaire',
      'obtenirIdOptionEtude',
      'obtenirIdReferentielProgramme',
      'obtenirIdReferentielCours',
      'obtenirIdMigrationReferentielProgramme',
    ] as const;

    for (const nomMethode of nomsMethodes) {
      const reference = this.executerMethodeIdentifiant(evenement, nomMethode);
      if (reference) {
        return reference;
      }
    }

    return undefined;
  }

  /** Cette methode execute de maniere defensive une methode de lecture d'identifiant si elle existe. */
  private static executerMethodeIdentifiant(
    evenement: EvenementDomaine,
    nomMethode: string,
  ): string | undefined {
    const methode = (evenement as unknown as Record<string, unknown>)[nomMethode];
    if (typeof methode !== 'function') {
      return undefined;
    }

    const resultat = (methode as () => unknown).call(evenement);
    if (typeof resultat === 'string') {
      return resultat;
    }

    if (
      typeof resultat === 'object' &&
      resultat !== null &&
      'obtenirValeur' in resultat &&
      typeof (resultat as { obtenirValeur: unknown }).obtenirValeur === 'function'
    ) {
      return ((resultat as { obtenirValeur: () => string }).obtenirValeur()).toString();
    }

    return undefined;
  }
}
