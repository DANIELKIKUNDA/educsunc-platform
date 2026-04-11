import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { MigrationReferentielProgrammeId } from '../value-objects/MigrationReferentielProgrammeId';

// Cet evenement de domaine trace l'analyse d'une migration de referentiel.
export class MigrationAnalysee extends EvenementDomaine {
  private readonly idMigrationReferentielProgramme: MigrationReferentielProgrammeId;

  // Ce constructeur initialise l'identifiant de la migration concernee.
  constructor(idMigrationReferentielProgramme: MigrationReferentielProgrammeId) {
    super('MigrationAnalysee');
    this.idMigrationReferentielProgramme = idMigrationReferentielProgramme;
  }

  // Cette methode retourne l'identifiant de la migration concernee.
  public obtenirIdMigrationReferentielProgramme(): MigrationReferentielProgrammeId {
    return this.idMigrationReferentielProgramme;
  }
}
