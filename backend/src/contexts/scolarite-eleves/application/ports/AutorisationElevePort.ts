// Ce port reapplique la doctrine locale permission + perimetre pour le workflow eleve.
export interface AutorisationElevePort {
  verifierLectureEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierMutationEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
