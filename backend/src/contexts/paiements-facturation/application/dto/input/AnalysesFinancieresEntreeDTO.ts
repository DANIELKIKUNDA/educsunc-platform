export interface ConsulterPaiementsParCaissierInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ConsulterPaiementsParTypeFraisInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ConsulterFondsAnticipesInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}
