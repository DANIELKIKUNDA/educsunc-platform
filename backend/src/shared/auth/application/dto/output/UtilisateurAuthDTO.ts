// Ce DTO expose les informations utiles d'un utilisateur authentifie.
export interface UtilisateurAuthDTO {
  idUtilisateur: string;
  nomComplet: string;
  email: string;
  etatCompte: string;
}
