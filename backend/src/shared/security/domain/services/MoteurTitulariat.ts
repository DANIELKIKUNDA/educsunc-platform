import { AffectationTitulariat } from '../aggregates/AffectationTitulariat';
import { PolicyEligibiliteTitulariat } from '../policies/PolicyEligibiliteTitulariat';
import { PolicyTitulariatClasse } from '../policies/PolicyTitulariatClasse';

// Ce moteur porte la logique d'attribution et de verification du titulariat.
export class MoteurTitulariat {
  public attribuerTitulariat(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClasse: string;
    idAnneeScolaire: string;
    creePar?: string;
    classePossedeDejaTitulaire?: boolean;
    codeRoleActif?: string;
    affectationActive: boolean;
    idOrganisationAffectation?: string;
    idEcoleAffectation?: string;
  }): AffectationTitulariat {
    PolicyTitulariatClasse.verifier(Boolean(params.classePossedeDejaTitulaire));
    PolicyEligibiliteTitulariat.verifier({
      codeRoleActif: params.codeRoleActif,
      affectationActive: params.affectationActive,
      idOrganisationAffectation: params.idOrganisationAffectation,
      idEcoleAffectation: params.idEcoleAffectation,
      idOrganisationTitulariat: params.idOrganisation,
      idEcoleTitulariat: params.idEcole,
    });
    return AffectationTitulariat.attribuer(params);
  }

  public verifierTitulariat(titulariat: AffectationTitulariat): void {
    titulariat.verifierTitulariat();
  }

  public estTitulariatActifPour(
    titulariat: AffectationTitulariat,
    params: {
      idOrganisation?: string;
      idEcole?: string;
      idClasse?: string;
      idAnneeScolaire?: string;
    },
  ): boolean {
    return titulariat.estActifDansScope(params);
  }
}
