// Ce port reapplique la doctrine locale permission + perimetre pour les familles.
export interface AutorisationFamillePort {
  verifierLectureFamille(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
  verifierMutationFamille(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void>;
}
