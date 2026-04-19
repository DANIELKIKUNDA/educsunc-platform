// Ce DTO represente les donnees attendues pour modifier une annee scolaire planifiee.
export interface ModifierAnneeScolaireEntree {
  idAnneeScolaire: string;
  code: string;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
  modifiePar: string;
}
