// Cette interface represente une section scolaire brute importee depuis un contenu JSON deja parse.
export interface EnregistrementSectionScolaireJson {
  code: string;
  libelle: string;
  ordreAffichage: number;
}

// Ce DTO represente les donnees attendues pour importer les sections scolaires depuis un JSON.
export interface ImporterSectionsDepuisJsonEntree {
  sections: EnregistrementSectionScolaireJson[];
  importePar: string;
}
