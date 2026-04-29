import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';

export interface DepotObligationFinanciere {
  sauvegarder(obligation: ObligationFinanciereEleve): Promise<void>;
  trouverParId(idObligation: string): Promise<ObligationFinanciereEleve | null>;
  listerParEleveEtAnnee(idEcole: string, idEleve: string, idAnneeScolaire: string): Promise<ObligationFinanciereEleve[]>;
}
