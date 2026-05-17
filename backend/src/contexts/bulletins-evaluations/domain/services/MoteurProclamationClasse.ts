import { ProclamationClasse } from '../aggregates/ProclamationClasse';
import { EleveAbandonProclamation } from '../entities/EleveAbandonProclamation';
import { EleveNonClasseProclamation } from '../entities/EleveNonClasseProclamation';
import { HistoriqueGenerationProclamation } from '../entities/HistoriqueGenerationProclamation';
import { LigneProclamationClasse } from '../entities/LigneProclamationClasse';

// Ce moteur orchestre la generation d'une proclamation de classe.
export class MoteurProclamationClasse {
  // Cette methode remplit la proclamation puis en recalcule les statistiques.
  public generer(
    proclamation: ProclamationClasse,
    lignesProclamation: LigneProclamationClasse[],
    elevesNonClasses: EleveNonClasseProclamation[],
    elevesAbandon: EleveAbandonProclamation[],
    historiqueGeneration: HistoriqueGenerationProclamation,
  ): void {
    proclamation.generer({
      lignesProclamation,
      elevesNonClasses,
      elevesAbandon,
      historiqueGeneration,
    });
    proclamation.calculerStatistiques();
  }
}
