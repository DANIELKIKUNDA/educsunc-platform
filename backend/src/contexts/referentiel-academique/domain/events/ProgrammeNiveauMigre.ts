import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ProgrammeNiveauId } from '../value-objects/ProgrammeNiveauId';

// Cet evenement de domaine trace la migration d'un programme niveau.
export class ProgrammeNiveauMigre extends EvenementDomaine {
  private readonly idProgrammeNiveau: ProgrammeNiveauId;

  // Ce constructeur initialise l'identifiant du programme niveau concerne.
  constructor(idProgrammeNiveau: ProgrammeNiveauId) {
    super('ProgrammeNiveauMigre');
    this.idProgrammeNiveau = idProgrammeNiveau;
  }

  // Cette methode retourne l'identifiant du programme niveau concerne.
  public obtenirIdProgrammeNiveau(): ProgrammeNiveauId {
    return this.idProgrammeNiveau;
  }
}
