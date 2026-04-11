import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { Organisation } from '../aggregates/Organisation';
import { OrganisationId } from '../value-objects/OrganisationId';

// Ce depot definit le contrat de persistance du referentiel des organisations.
export interface DepotOrganisation {
  // Cette methode recherche une organisation par son identifiant metier.
  trouverParId(idOrganisation: OrganisationId): Promise<Organisation | null>;

  // Cette methode recherche une organisation par son code fonctionnel.
  trouverParCode(code: string): Promise<Organisation | null>;

  // Cette methode recherche une organisation par son nom.
  trouverParNom(nom: string): Promise<Organisation | null>;

  // Cette methode retourne une lecture paginee des organisations.
  lister(pagination: Pagination): Promise<ResultatPagine<Organisation>>;

  // Cette methode persiste l'etat courant d'une organisation.
  sauvegarder(organisation: Organisation): Promise<void>;
}
