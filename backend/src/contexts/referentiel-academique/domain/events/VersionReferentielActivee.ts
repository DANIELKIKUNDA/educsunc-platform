import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Cet evenement de domaine trace l'activation d'une version de referentiel.
export class VersionReferentielActivee extends EvenementDomaine {
  private readonly idVersionReferentielProgramme: VersionReferentielProgrammeId;

  // Ce constructeur initialise l'identifiant de la version de referentiel concernee.
  constructor(idVersionReferentielProgramme: VersionReferentielProgrammeId) {
    super('VersionReferentielActivee');
    this.idVersionReferentielProgramme = idVersionReferentielProgramme;
  }

  // Cette methode retourne l'identifiant de la version de referentiel concernee.
  public obtenirIdVersionReferentielProgramme(): VersionReferentielProgrammeId {
    return this.idVersionReferentielProgramme;
  }
}
