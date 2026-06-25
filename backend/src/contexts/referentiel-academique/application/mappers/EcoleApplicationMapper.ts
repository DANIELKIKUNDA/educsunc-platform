import { Ecole } from '../../domain/aggregates/Ecole';
import { EcoleSortie } from '../dto/output/EcoleSortie';

// Ce mapper transforme l'agregat Ecole en DTO de sortie applicatif.
export class EcoleApplicationMapper {
  // Cette methode projette une ecole de domaine vers un contrat de sortie stable.
  public static versSortie(ecole: Ecole): EcoleSortie {
    return {
      id: ecole.obtenirId().obtenirValeur(),
      idOrganisation: ecole.obtenirOrganisationId().obtenirValeur(),
      code: ecole.obtenirCode(),
      nom: ecole.obtenirNom(),
      modeExploitation: ecole.obtenirModeExploitation(),
      actif: ecole.estActif(),
      creeLe: ecole.obtenirCreeLe().toISOString(),
      version: ecole.obtenirVersion(),
      sigle: ecole.obtenirSigle(),
      adresse: ecole.obtenirAdresse(),
      telephone: ecole.obtenirTelephone(),
      email: ecole.obtenirEmail(),
      provinceEducationnelle: ecole.obtenirProvinceEducationnelle(),
      ville: ecole.obtenirVille(),
      communeOuTerritoire: ecole.obtenirCommuneOuTerritoire(),
      creePar: ecole.obtenirCreePar(),
      modifieLe: ecole.obtenirModifieLe()?.toISOString(),
      modifiePar: ecole.obtenirModifiePar(),
    };
  }
}
