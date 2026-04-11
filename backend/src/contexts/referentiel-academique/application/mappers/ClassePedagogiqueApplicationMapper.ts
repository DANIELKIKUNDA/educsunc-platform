import { ClassePedagogique } from '../../domain/aggregates/ClassePedagogique';
import { ClassePedagogiqueSortie } from '../dto/output/ClassePedagogiqueSortie';

// Ce mapper transforme l'agregat ClassePedagogique en DTO de sortie applicatif.
export class ClassePedagogiqueApplicationMapper {
  // Cette methode projette une classe pedagogique de domaine vers un contrat de sortie stable.
  public static versSortie(classePedagogique: ClassePedagogique): ClassePedagogiqueSortie {
    return {
      id: classePedagogique.obtenirId().obtenirValeur(),
      idEcole: classePedagogique.obtenirEcoleId().obtenirValeur(),
      idAnneeScolaire: classePedagogique.obtenirAnneeScolaireId().obtenirValeur(),
      idClasseAcademique: classePedagogique.obtenirClasseAcademiqueId().obtenirValeur(),
      code: classePedagogique.obtenirCode(),
      libelle: classePedagogique.obtenirLibelle(),
      active: classePedagogique.estActive(),
      creeLe: classePedagogique.obtenirCreeLe().toISOString(),
      version: classePedagogique.obtenirVersion(),
      suffixeParallele: classePedagogique.obtenirSuffixeParallele(),
      capaciteAccueil: classePedagogique.obtenirCapaciteAccueil(),
      archiveLe: classePedagogique.obtenirArchiveLe()?.toISOString(),
      modifieLe: classePedagogique.obtenirModifieLe()?.toISOString(),
    };
  }
}
