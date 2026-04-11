import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { Ecole } from '../aggregates/Ecole';
import { EcoleId } from '../value-objects/EcoleId';
import { OrganisationId } from '../value-objects/OrganisationId';

// Ce depot definit le contrat de persistance des ecoles rattachees au referentiel.
export interface DepotEcole {
  // Cette methode recherche une ecole par son identifiant metier.
  trouverParId(idEcole: EcoleId): Promise<Ecole | null>;

  // Cette methode recherche une ecole par son code fonctionnel.
  trouverParCode(code: string): Promise<Ecole | null>;

  // Cette methode liste les ecoles d'une organisation avec pagination.
  listerParOrganisation(
    idOrganisation: OrganisationId,
    pagination: Pagination,
  ): Promise<ResultatPagine<Ecole>>;

  // Cette methode retourne une lecture paginee de l'ensemble des ecoles.
  lister(pagination: Pagination): Promise<ResultatPagine<Ecole>>;

  // Cette methode persiste l'etat courant d'une ecole.
  sauvegarder(ecole: Ecole): Promise<void>;
}
