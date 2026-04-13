// Ce DTO porte la demande de garantie d'une annee scolaire active pour une ecole.
export interface GarantirAnneeScolaireActiveParEcoleEntree {
  idEcole: string;
  modifiePar: string;
  dateReference?: Date;
  dateDebut?: Date;
  dateFin?: Date;
}
