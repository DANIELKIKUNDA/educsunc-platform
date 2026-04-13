// Ce DTO porte la demande de bascule administrative annuelle d'une ecole.
export interface BasculerAnneeScolaireEntree {
  idEcole: string;
  modifiePar: string;
  creerSuivanteSiAbsente?: boolean;
  dateDebutSuivante?: Date;
  dateFinSuivante?: Date;
}
