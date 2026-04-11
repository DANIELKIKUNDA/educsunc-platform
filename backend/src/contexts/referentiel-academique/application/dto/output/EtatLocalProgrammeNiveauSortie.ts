import { StatutProgrammeNiveau } from '../../../domain/value-objects/StatutProgrammeNiveau';
import { LigneProgrammeNiveauSortie } from './LigneProgrammeNiveauSortie';

// Ce DTO represente la forme de sortie standard de l'etat local d'un programme niveau.
export interface EtatLocalProgrammeNiveauSortie {
  statut: StatutProgrammeNiveau;
  lignes: LigneProgrammeNiveauSortie[];
  nombreLignesActivesDansEcole: number;
  nombreLignesNonCalculables: number;
  nombreLignesObsoletes: number;
}
