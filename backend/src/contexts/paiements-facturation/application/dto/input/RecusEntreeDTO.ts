export interface GenererRecuPaiementInput {
  idPaiement: string;
  idCaissier: string;
}

export interface ReimprimerRecuInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idRecu: string;
}

export interface ConsulterRecusPaiementInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idEleve?: string;
  numeroRecu?: string;
  dateDebut?: string;
  dateFin?: string;
}
