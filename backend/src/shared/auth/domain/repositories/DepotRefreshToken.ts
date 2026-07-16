import { RefreshToken } from '../aggregates/RefreshToken';

// Ce depot definit le contrat de persistance des refresh tokens.
export interface DepotRefreshToken {
  sauvegarder(refreshToken: RefreshToken): Promise<void>;
  trouverParHash(tokenHash: string): Promise<RefreshToken | null>;
  trouverParId(idRefreshToken: string): Promise<RefreshToken | null>;
  revoquer(idRefreshToken: string): Promise<void>;
  revoquerParUtilisateur(idUtilisateur: string): Promise<void>;
}
