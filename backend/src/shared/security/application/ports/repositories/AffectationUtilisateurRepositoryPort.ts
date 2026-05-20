import type { AffectationUtilisateur } from '../../../domain';
export interface AffectationUtilisateurRepositoryPort {
  sauvegarder(affectationUtilisateur: AffectationUtilisateur): Promise<void>;
  trouverParId(idAffectationUtilisateur: string): Promise<AffectationUtilisateur | null>;
  listerActivesParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]>;
}
