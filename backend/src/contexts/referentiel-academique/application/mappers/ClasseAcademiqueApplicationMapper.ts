import { ClasseAcademique } from '../../domain/aggregates/ClasseAcademique';
import { ClasseAcademiqueSortie } from '../dto/output/ClasseAcademiqueSortie';

// Ce mapper transforme l'agregat ClasseAcademique en DTO de sortie applicatif.
export class ClasseAcademiqueApplicationMapper {
  // Cette methode projette une classe academique de domaine vers un contrat de sortie stable.
  public static versSortie(classeAcademique: ClasseAcademique): ClasseAcademiqueSortie {
    return {
      id: classeAcademique.obtenirId().obtenirValeur(),
      idSectionScolaire: classeAcademique.obtenirSectionScolaireId().obtenirValeur(),
      idOptionEtude: classeAcademique.obtenirOptionEtudeId()?.obtenirValeur(),
      code: classeAcademique.obtenirCode(),
      libelle: classeAcademique.obtenirLibelle(),
      ordrePedagogique: classeAcademique.obtenirOrdrePedagogiqueNumerique(),
      cycle: classeAcademique.obtenirCycle(),
      accepteOptions: classeAcademique.accepteOptionsEtude(),
      optionObligatoire: classeAcademique.estOptionObligatoire(),
      typeStructureEvaluation: classeAcademique.obtenirTypeStructureEvaluation(),
      active: classeAcademique.estActive(),
      creeLe: classeAcademique.obtenirCreeLe().toISOString(),
      version: classeAcademique.obtenirVersion(),
      modifieLe: classeAcademique.obtenirModifieLe()?.toISOString(),
    };
  }
}
