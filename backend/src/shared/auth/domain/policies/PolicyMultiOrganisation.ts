import { ErreurOrganisationActiveInvalide } from '../exceptions/ErreurOrganisationActiveInvalide';

// Cette policy verifie qu'un utilisateur peut selectionner une organisation donnee.
export class PolicyMultiOrganisation {
  public static verifier(accesOrganisations: readonly string[], organisationActiveId?: string): void {
    if (!organisationActiveId) {
      return;
    }

    if (!accesOrganisations.includes(organisationActiveId)) {
      throw new ErreurOrganisationActiveInvalide();
    }
  }
}
