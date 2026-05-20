import { ErreurContexteActifInvalide } from '../exceptions/ErreurContexteActifInvalide';

export class PolicyIsolationTenant {
  public static verifier(idOrganisationActive?: string, idEcoleActive?: string, ecoleAppartientOrganisation = true): void {
    if (idEcoleActive && !idOrganisationActive) {
      throw new ErreurContexteActifInvalide('Une ecole active exige une organisation active.');
    }

    if (idEcoleActive && !ecoleAppartientOrganisation) {
      throw new ErreurContexteActifInvalide("L'ecole active n'appartient pas a l'organisation active.");
    }
  }
}
