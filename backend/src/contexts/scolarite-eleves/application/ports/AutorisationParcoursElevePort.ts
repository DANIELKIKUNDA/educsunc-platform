// Ce port reapplique la doctrine locale permission + perimetre pour le parcours scolaire.
export interface AutorisationParcoursElevePort {
  verifierConsultationParcoursEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
  verifierReconstructionParcoursEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
  listerSectionsLectureAutorisees(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<string[]>;
}
