import { Organisation } from '../../domain/aggregates/Organisation';
import { OrganisationSortie } from '../dto/output/OrganisationSortie';

// Ce mapper transforme l'agregat Organisation en DTO de sortie applicatif.
export class OrganisationApplicationMapper {
  // Cette methode projette une organisation de domaine vers un contrat de sortie stable.
  public static versSortie(organisation: Organisation): OrganisationSortie {
    return {
      id: organisation.obtenirId().obtenirValeur(),
      code: organisation.obtenirCode(),
      nom: organisation.obtenirNom(),
      typeOrganisation: organisation.obtenirTypeOrganisation(),
      actif: organisation.estActif(),
      creeLe: organisation.obtenirCreeLe().toISOString(),
      creePar: organisation.obtenirCreePar(),
      description: organisation.obtenirDescription(),
      version: organisation.obtenirVersion(),
    };
  }
}
