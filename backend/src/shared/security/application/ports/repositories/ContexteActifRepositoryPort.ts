import type { ContexteActifUtilisateur } from '../../../domain';
export interface ContexteActifRepositoryPort {
  sauvegarder(contexteActifUtilisateur: ContexteActifUtilisateur): Promise<void>;
  trouverParUtilisateur(idUtilisateur: string): Promise<ContexteActifUtilisateur | null>;
}
