import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { VersionReferentielProgramme } from '../aggregates/VersionReferentielProgramme';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Ce depot expose uniquement des lectures secondaires sur les versions officielles.
export interface DepotVersionReferentielProgramme {
  // Cette methode recherche une version officielle par son identifiant metier.
  trouverParId(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<VersionReferentielProgramme | null>;

  // Cette methode liste des versions par annee de reference pour des besoins de consultation.
  listerParAnneeReference(
    anneeReference: string,
    pagination: Pagination,
  ): Promise<ResultatPagine<VersionReferentielProgramme>>;
}
