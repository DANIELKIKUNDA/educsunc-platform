import { PolicyScopeEcole } from '../policies/PolicyScopeEcole';
import { PolicyScopeOrganisation } from '../policies/PolicyScopeOrganisation';

// Ce moteur centralise la verification des portees organisation et ecole.
export class MoteurScope {
  public verifierOrganisation(organisationsAutorisees: readonly string[], idOrganisation?: string): void {
    PolicyScopeOrganisation.verifier(organisationsAutorisees, idOrganisation);
  }

  public verifierEcole(ecolesAutorisees: readonly string[], idEcole?: string): void {
    PolicyScopeEcole.verifier(ecolesAutorisees, idEcole);
  }
}
