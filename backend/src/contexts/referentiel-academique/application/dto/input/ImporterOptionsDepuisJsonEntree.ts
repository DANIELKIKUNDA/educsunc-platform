// Cette interface represente une option d'etude brute importee depuis un contenu JSON deja parse.
export interface EnregistrementOptionEtudeJson {
  code: number;
  libelle: string;
  typeOption?: string;
  ordreAffichage?: number;
}

// Ce DTO represente les donnees attendues pour importer les options d'etude depuis un JSON.
export interface ImporterOptionsDepuisJsonEntree {
  options: EnregistrementOptionEtudeJson[];
  importePar: string;
}
