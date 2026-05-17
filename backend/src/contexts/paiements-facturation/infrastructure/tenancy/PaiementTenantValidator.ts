// Ce fichier centralise les verifications d'appartenance tenant specifiques au BC Paiements.
export class PaiementTenantValidator {
  // Cette methode verifie qu'une ressource financiere appartient bien a l'ecole attendue.
  public verifierAppartenanceEcole(
    idEcoleAttendue: string,
    idEcoleRessource: string,
  ): void {
    if (idEcoleAttendue !== idEcoleRessource) {
      throw new Error(
        'La ressource financiere appartient a une autre ecole.',
      );
    }
  }

  // Cette methode verifie qu'une ressource financiere est exploitee dans la bonne organisation lorsque l'information existe.
  public verifierAppartenanceOrganisation(
    idOrganisationAttendue: string,
    idOrganisationRessource: string,
  ): void {
    if (idOrganisationAttendue !== idOrganisationRessource) {
      throw new Error(
        'La ressource financiere appartient a une autre organisation.',
      );
    }
  }
}
