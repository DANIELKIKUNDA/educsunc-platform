import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ReferentielProgrammeId } from '../value-objects/ReferentielProgrammeId';

// Cet evenement de domaine trace l'activation d'un referentiel programme.
export class ReferentielProgrammeActive extends EvenementDomaine {
  private readonly idReferentielProgramme: ReferentielProgrammeId;

  // Ce constructeur initialise l'identifiant du referentiel programme concerne.
  constructor(idReferentielProgramme: ReferentielProgrammeId) {
    super('ReferentielProgrammeActive');
    this.idReferentielProgramme = idReferentielProgramme;
  }

  // Cette methode retourne l'identifiant du referentiel programme concerne.
  public obtenirIdReferentielProgramme(): ReferentielProgrammeId {
    return this.idReferentielProgramme;
  }
}
