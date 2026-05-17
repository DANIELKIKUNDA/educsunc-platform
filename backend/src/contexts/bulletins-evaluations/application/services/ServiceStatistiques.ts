import type { ProclamationClasse } from '../../domain/aggregates/ProclamationClasse';
import type { SyntheseResultatsEcole } from '../../domain/aggregates/SyntheseResultatsEcole';
import type { LigneSyntheseResultatsClasse } from '../../domain/entities/LigneSyntheseResultatsClasse';

// Ce service centralise les calculs applicatifs de statistiques et de synthese.
export class ServiceStatistiques {
  // Cette methode recalcule les statistiques d'une proclamation.
  public calculerProclamation(proclamation: ProclamationClasse): void {
    proclamation.calculerStatistiques();
  }

  // Cette methode remplit puis totalise une synthese globale d'ecole.
  public calculerSynthese(synthese: SyntheseResultatsEcole, lignes: LigneSyntheseResultatsClasse[]): void {
    synthese.genererDepuisProclamations(lignes);
    synthese.calculerTotauxEcole();
  }
}
