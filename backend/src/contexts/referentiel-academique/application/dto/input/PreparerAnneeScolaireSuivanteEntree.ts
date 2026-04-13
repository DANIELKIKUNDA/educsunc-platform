// Ce DTO porte la demande de preparation de l'annee scolaire suivante.
export interface PreparerAnneeScolaireSuivanteEntree {
  idEcole: string;
  creePar: string;
  dateDebut?: Date;
  dateFin?: Date;
}
