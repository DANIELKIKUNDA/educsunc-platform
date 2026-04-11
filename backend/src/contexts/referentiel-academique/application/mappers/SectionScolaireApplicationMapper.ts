import { SectionScolaire } from '../../domain/aggregates/SectionScolaire';
import { SectionScolaireSortie } from '../dto/output/SectionScolaireSortie';

// Ce mapper transforme l'agregat SectionScolaire en DTO de sortie applicatif.
export class SectionScolaireApplicationMapper {
  // Cette methode projette une section scolaire de domaine vers un contrat de sortie stable.
  public static versSortie(sectionScolaire: SectionScolaire): SectionScolaireSortie {
    return {
      id: sectionScolaire.obtenirId().obtenirValeur(),
      code: sectionScolaire.obtenirCode(),
      libelle: sectionScolaire.obtenirLibelle(),
      ordreAffichage: sectionScolaire.obtenirOrdreAffichage(),
      active: sectionScolaire.estActive(),
      creeLe: sectionScolaire.obtenirCreeLe().toISOString(),
      version: sectionScolaire.obtenirVersion(),
      modifieLe: sectionScolaire.obtenirModifieLe()?.toISOString(),
    };
  }
}
