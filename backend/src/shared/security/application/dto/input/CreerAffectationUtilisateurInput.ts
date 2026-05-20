export interface CreerAffectationUtilisateurInput {
  idUtilisateur: string;
  idRole: string;
  niveauAcces: string;
  idOrganisation?: string;
  idEcole?: string;
  idSection?: string;
  idClasse?: string;
  idCours?: string;
  creePar?: string;
}
