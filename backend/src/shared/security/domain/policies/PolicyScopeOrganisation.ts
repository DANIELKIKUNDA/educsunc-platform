import { ErreurOrganisationNonAutorisee } from '../exceptions/ErreurOrganisationNonAutorisee';

export class PolicyScopeOrganisation {
  public static verifier(organisationsAutorisees: readonly string[], idOrganisation?: string): void {
    if (!idOrganisation) {
      return;
    }

    if (!organisationsAutorisees.includes(idOrganisation)) {
      throw new ErreurOrganisationNonAutorisee();
    }
  }
}
