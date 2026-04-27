import { ChangerStatutEleve, ChangerStatutEleveEntree, SortieChangerStatutEleve } from '../use-cases/eleves/ChangerStatutEleve';

// Ce fichier contient l'orchestrateur applicatif du cycle de vie de l'eleve.
/**
 * Cet orchestrateur centralise les changements de statut et laisse le domaine valider les transitions.
 */
export class OrchestrateurCycleVieEleve {
  constructor(private readonly changerStatutEleve: ChangerStatutEleve) {}

  /** Execute un changement de statut de cycle de vie. */
  public changerStatut(entree: ChangerStatutEleveEntree): Promise<SortieChangerStatutEleve> {
    return this.changerStatutEleve.executer(entree);
  }
}
