export interface AnnulerPaiementInput {
  idPaiement: string;
  raison: string;
  annulePar: string;
}

export interface RestituerExcedentInput {
  idPaiement: string;
  idEcole: string;
  idEleve: string;
  effectuePar: string;
}
