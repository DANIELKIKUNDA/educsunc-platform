import { SyntheseResultatsEcole } from '../aggregates/SyntheseResultatsEcole';
import { LigneSyntheseResultatsClasse } from '../entities/LigneSyntheseResultatsClasse';

// Ce moteur orchestre la synthese globale des resultats d'une ecole.
export class MoteurSyntheseResultatsEcole {
  // Cette methode remplit la synthese puis calcule les totaux ecole.
  public genererDepuisProclamations(
    synthese: SyntheseResultatsEcole,
    lignesSynthese: LigneSyntheseResultatsClasse[],
  ): void {
    synthese.genererDepuisProclamations(lignesSynthese);
    synthese.calculerTotauxEcole();
  }
}
