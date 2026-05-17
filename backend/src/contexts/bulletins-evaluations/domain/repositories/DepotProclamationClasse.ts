import { ProclamationClasse } from '../aggregates/ProclamationClasse';

// Ce contrat abstrait la persistence des proclamations de classe.
export interface DepotProclamationClasse {
  sauvegarder(proclamationClasse: ProclamationClasse): Promise<void>;
  trouverParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<ProclamationClasse | null>;
  listerParClasseEtAnnee(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]>;
  listerHistoriqueProclamations(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]>;
}
