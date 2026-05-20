import { OptionEtude } from '../../domain/aggregates/OptionEtude';
import { OptionEtudeSortie } from '../dto/output/OptionEtudeSortie';

// Ce mapper transforme l'agregat OptionEtude en DTO de sortie applicatif.
export class OptionEtudeApplicationMapper {
  // Cette methode projette une option d'etude de domaine vers un contrat de sortie stable.
  public static versSortie(optionEtude: OptionEtude): OptionEtudeSortie {
    return {
      id: optionEtude.obtenirId().obtenirValeur(),
      code: optionEtude.obtenirCodeNumerique(),
      libelle: optionEtude.obtenirLibelle(),
      typeOption: optionEtude.obtenirTypeOption(),
      estTechnique: optionEtude.estTechnique(),
      categorieTechnique: optionEtude.obtenirCategorieTechnique(),
      abreviation: optionEtude.obtenirAbreviation(),
      ordreAffichage: optionEtude.obtenirOrdreAffichage(),
      active: optionEtude.estActive(),
      creeLe: optionEtude.obtenirCreeLe().toISOString(),
      version: optionEtude.obtenirVersion(),
      modifieLe: optionEtude.obtenirModifieLe()?.toISOString(),
    };
  }
}
