// Ce DTO represente les donnees attendues pour creer une annee scolaire.
export interface CreerAnneeScolaireEntree {
  idEcole: string;
  code: string;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
  creePar: string;
}
