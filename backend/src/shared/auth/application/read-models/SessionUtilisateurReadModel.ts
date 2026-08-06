// Ce read model porte la lecture optimisee d'une session utilisateur.
export interface SessionUtilisateurReadModel {
  sessionId: string;
  utilisateurId: string;
  roleActif?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  estOffline: boolean;
}
