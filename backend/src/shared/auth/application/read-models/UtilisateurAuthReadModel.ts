// Ce read model porte la lecture optimisee d'un utilisateur AUTH.
export interface UtilisateurAuthReadModel {
  idUtilisateur: string;
  nomComplet: string;
  email: string;
  etatCompte: string;
  dernierAccesLe?: string;
}
