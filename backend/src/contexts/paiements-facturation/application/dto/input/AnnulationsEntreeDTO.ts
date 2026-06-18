export interface AnnulerPaiementInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idPaiement: string;
  raison: string;
  annulePar: string;
}

export interface RestituerExcedentInput {
  idOrganisation: string;
  idPaiement: string;
  idEcole: string;
  idUtilisateur: string;
  idEleve: string;
  effectuePar: string;
}
