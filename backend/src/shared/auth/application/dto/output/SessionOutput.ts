// Ce DTO expose l'etat applicatif d'une session utilisateur.
export interface SessionOutput {
  sessionId: string;
  utilisateurId: string;
  roleActif?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  estOffline: boolean;
}
