// Ce port reapplique la doctrine locale permission + perimetre pour les lectures organisationnelles de scolarite.
export interface AutorisationOrganisationScolaritePort {
  verifierLectureOrganisationScolarite(params: {
    idUtilisateur: string;
    idOrganisation: string;
  }): Promise<void>;
}
