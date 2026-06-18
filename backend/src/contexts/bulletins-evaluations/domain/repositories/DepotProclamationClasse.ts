import { ProclamationClasse } from '../aggregates/ProclamationClasse';
import { EtatProclamation } from '../value-objects/EtatProclamation';

// Ce contrat abstrait la persistence des proclamations de classe.
export interface DepotProclamationClasse {
  sauvegarder(proclamationClasse: ProclamationClasse): Promise<void>;
  trouverParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<ProclamationClasse | null>;
  listerParClasseEtAnnee(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]>;
  listerParEcoleEtColonne(idEcole: string, codeColonne: string, idAnneeScolaire: string): Promise<ProclamationClasse[]>;
  listerHistoriqueProclamations(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]>;
  changerEtatProclamation(idProclamationClasse: string, etatProclamation: EtatProclamation): Promise<void>;
  verrouillerProclamation(idProclamationClasse: string, verrouillePar: string): Promise<void>;
}
