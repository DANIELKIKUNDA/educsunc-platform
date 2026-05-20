import { SessionUtilisateur } from '../aggregates/SessionUtilisateur';

// Ce depot definit le contrat de persistance des sessions utilisateurs.
export interface DepotSessionUtilisateur {
  sauvegarder(session: SessionUtilisateur): Promise<void>;
  trouverSessionActive(idSessionUtilisateur: string): Promise<SessionUtilisateur | null>;
  revoquerSessionsUtilisateur(idUtilisateur: string, raisonRevocation?: string): Promise<void>;
}
