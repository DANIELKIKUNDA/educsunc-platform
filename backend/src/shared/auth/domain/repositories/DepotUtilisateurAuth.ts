import { UtilisateurAuth } from '../aggregates/UtilisateurAuth';

// Ce depot definit le contrat de persistance des utilisateurs AUTH.
export interface DepotUtilisateurAuth {
  sauvegarder(utilisateur: UtilisateurAuth): Promise<void>;
  trouverParId(idUtilisateur: string): Promise<UtilisateurAuth | null>;
  trouverParEmail(email: string): Promise<UtilisateurAuth | null>;
  existeEmail(email: string): Promise<boolean>;
}
