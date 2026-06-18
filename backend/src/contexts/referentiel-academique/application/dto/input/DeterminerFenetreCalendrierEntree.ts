// Ce DTO porte les informations necessaires au calcul de la fenetre temporelle d'un calendrier.
export interface DeterminerFenetreCalendrierEntree {
  idEcole: string;
  idAnneeScolaire: string;
  dateReference?: Date;
}
