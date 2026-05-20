import { ErreurContexteTenantIncoherent } from '../exceptions/ErreurContexteTenantIncoherent';

// Cette policy verifie la coherence minimale d'un contexte actif utilisateur.
export class PolicyContexteActif {
  public static verifier(params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
    ecoleAppartientOrganisation?: boolean;
  }): void {
    if (params.ecoleActiveId && !params.organisationActiveId) {
      throw new ErreurContexteTenantIncoherent('Une ecole active exige une organisation active.');
    }

    if (params.ecoleActiveId && params.ecoleAppartientOrganisation === false) {
      throw new ErreurContexteTenantIncoherent();
    }
  }
}
