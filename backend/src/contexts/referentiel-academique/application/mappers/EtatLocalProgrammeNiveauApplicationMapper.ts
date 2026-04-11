import { EtatLocalProgrammeNiveau } from '../../domain/aggregates/ProgrammeNiveau';
import { EtatLocalProgrammeNiveauSortie } from '../dto/output/EtatLocalProgrammeNiveauSortie';
import { LigneProgrammeNiveauApplicationMapper } from './LigneProgrammeNiveauApplicationMapper';

// Ce mapper transforme l'etat local d'un programme niveau en DTO de sortie applicatif.
export class EtatLocalProgrammeNiveauApplicationMapper {
  // Cette methode projette un etat local de domaine vers un contrat de sortie stable.
  public static versSortie(etatLocalProgrammeNiveau: EtatLocalProgrammeNiveau): EtatLocalProgrammeNiveauSortie {
    return {
      statut: etatLocalProgrammeNiveau.statut,
      lignes: etatLocalProgrammeNiveau.lignes.map((ligne) => (
        LigneProgrammeNiveauApplicationMapper.versSortie(ligne)
      )),
      nombreLignesActivesDansEcole: etatLocalProgrammeNiveau.nombreLignesActivesDansEcole,
      nombreLignesNonCalculables: etatLocalProgrammeNiveau.nombreLignesNonCalculables,
      nombreLignesObsoletes: etatLocalProgrammeNiveau.nombreLignesObsoletes,
    };
  }
}
