export interface AutorisationExonerationPort {
  verifierGestionExoneration(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void>;
}
