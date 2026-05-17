import { SyntheseResultatsEcole } from '../aggregates/SyntheseResultatsEcole';

// Ce contrat abstrait la persistence des syntheses globales de resultats d'une ecole.
export interface DepotSyntheseResultatsEcole {
  sauvegarder(syntheseResultatsEcole: SyntheseResultatsEcole): Promise<void>;
  trouverParEcoleEtColonne(idEcole: string, codeColonne: string, idAnneeScolaire: string): Promise<SyntheseResultatsEcole | null>;
  listerParAnnee(idEcole: string, idAnneeScolaire: string): Promise<SyntheseResultatsEcole[]>;
}
