// Cette interface represente un cours officiel brut importe depuis un contenu JSON deja parse.
export interface EnregistrementReferentielCoursJson {
  code: string;
  libelle: string;
  abreviation?: string;
  domaine?: string;
  sousDomaine?: string;
}

// Ce DTO represente les donnees attendues pour importer les cours academiques depuis un JSON.
export interface ImporterCoursAcademiquesDepuisJsonEntree {
  cours: EnregistrementReferentielCoursJson[];
  importePar: string;
}
