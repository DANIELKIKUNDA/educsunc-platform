import { ErreurTitulariatHorsScope } from '../exceptions/ErreurTitulariatHorsScope';
import { ErreurTitulariatReserveEnseignant } from '../exceptions/ErreurTitulariatReserveEnseignant';

export class PolicyEligibiliteTitulariat {
  public static verifier(params: {
    codeRoleActif?: string;
    affectationActive: boolean;
    idOrganisationAffectation?: string;
    idEcoleAffectation?: string;
    idOrganisationTitulariat: string;
    idEcoleTitulariat: string;
  }): void {
    if (params.codeRoleActif !== 'ENSEIGNANT' || !params.affectationActive) {
      throw new ErreurTitulariatReserveEnseignant();
    }

    if (params.idOrganisationAffectation !== params.idOrganisationTitulariat) {
      throw new ErreurTitulariatHorsScope();
    }

    if (params.idEcoleAffectation !== params.idEcoleTitulariat) {
      throw new ErreurTitulariatHorsScope();
    }
  }
}
