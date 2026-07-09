import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { MigrationReferentielProgramme } from '../aggregates/MigrationReferentielProgramme';
import { MigrationReferentielProgrammeId } from '../value-objects/MigrationReferentielProgrammeId';
import { ProgrammeNiveauId } from '../value-objects/ProgrammeNiveauId';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Ce depot definit le contrat de persistance des migrations de referentiel historisees.
export interface DepotMigrationReferentielProgramme {
  // Cette methode recherche une migration de referentiel par son identifiant metier.
  trouverParId(
    idMigrationReferentielProgramme: MigrationReferentielProgrammeId,
  ): Promise<MigrationReferentielProgramme | null>;

  // Cette methode liste les migrations rattachees a un programme niveau.
  listerParProgrammeNiveau(
    idProgrammeNiveau: ProgrammeNiveauId,
    pagination: Pagination,
  ): Promise<ResultatPagine<MigrationReferentielProgramme>>;

  // Cette methode indique si une version officielle est deja engagee dans une migration non annulee.
  estVersionEngagee(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<boolean>;

  // Cette methode persiste l'etat courant d'une migration de referentiel.
  sauvegarder(
    migrationReferentielProgramme: MigrationReferentielProgramme,
  ): Promise<void>;
}
