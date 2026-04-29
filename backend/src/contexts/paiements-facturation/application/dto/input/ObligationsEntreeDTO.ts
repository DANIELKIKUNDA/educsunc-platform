export interface GenererObligationsEleveInput {
  idEleve: string;
  idInscriptionScolaire: string;
  idEcole: string;
  idAnneeScolaire: string;
  creePar?: string;
}

export interface GenererObligationsMasseInput {
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique?: string;
  idsEleves?: string[];
  creePar?: string;
}
