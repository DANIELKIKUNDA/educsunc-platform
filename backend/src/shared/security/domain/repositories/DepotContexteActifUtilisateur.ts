import { ContexteActifUtilisateur } from '../aggregates/ContexteActifUtilisateur';

export interface DepotContexteActifUtilisateur {
  sauvegarder(contexteActifUtilisateur: ContexteActifUtilisateur): Promise<void>;
  trouverParUtilisateur(idUtilisateur: string): Promise<ContexteActifUtilisateur | null>;
}
