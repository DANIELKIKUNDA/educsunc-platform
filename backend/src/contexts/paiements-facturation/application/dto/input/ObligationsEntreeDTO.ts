export interface GenererObligationsEleveInput {
  idEleve: string;
  idInscriptionScolaire: string;
  idOrganisation?: string;
  idEcole: string;
  idAnneeScolaire: string;
  creePar?: string;
  roleActif?: string;
}

export interface GenererObligationsMasseInput {
  idOrganisation?: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique?: string;
  idsEleves?: string[];
  creePar?: string;
  roleActif?: string;
}
