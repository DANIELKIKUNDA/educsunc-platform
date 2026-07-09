// Cette interface represente un changement d'ordre cible pour une ligne de version.
export interface ReordonnancementLigneVersionReferentielProgrammeEntree {
  idLigneReferentielProgramme: string;
  ordreAffichage: number;
}

// Ce DTO represente les donnees attendues pour reordonner plusieurs lignes d'une version de travail.
export interface ReordonnerLignesVersionReferentielProgrammeEntree {
  idVersionReferentielProgramme: string;
  lignes: ReordonnancementLigneVersionReferentielProgrammeEntree[];
  reordonneePar: string;
}
