import { ContexteActifAuth } from '../aggregates/ContexteActifAuth';

// Ce depot definit le contrat de persistance du contexte actif AUTH.
export interface DepotContexteActifAuth {
  sauvegarder(contexteActif: ContexteActifAuth): Promise<void>;
  trouverContexteUtilisateur(idUtilisateur: string): Promise<ContexteActifAuth | null>;
}
