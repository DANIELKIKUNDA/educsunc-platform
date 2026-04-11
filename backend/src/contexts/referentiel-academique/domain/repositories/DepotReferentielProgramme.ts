import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { ReferentielProgramme } from '../aggregates/ReferentielProgramme';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { ReferentielProgrammeId } from '../value-objects/ReferentielProgrammeId';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Ce depot definit le contrat de persistance du referentiel programme racine et de son graphe officiel.
export interface DepotReferentielProgramme {
  // Cette methode recherche un referentiel programme par son identifiant metier.
  trouverParId(
    idReferentielProgramme: ReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null>;

  // Cette methode recherche le referentiel programme principal d'une classe academique.
  trouverParClasseAcademique(
    idClasseAcademique: ClasseAcademiqueId,
  ): Promise<ReferentielProgramme | null>;

  // Cette methode recherche un referentiel programme en se basant sur l'identifiant d'une version enfant.
  trouverParIdVersion(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null>;

  // Cette methode liste les referentiels programmes d'une classe academique.
  listerParClasseAcademique(
    idClasseAcademique: ClasseAcademiqueId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ReferentielProgramme>>;

  // Cette methode persiste l'etat courant d'un referentiel programme.
  sauvegarder(referentielProgramme: ReferentielProgramme): Promise<void>;
}
