import { UtilisateurAuthDTO } from './UtilisateurAuthDTO';

// Ce DTO represente la sortie complete d'une authentification reussie.
export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  utilisateur: UtilisateurAuthDTO;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  expireLe?: string;
}
