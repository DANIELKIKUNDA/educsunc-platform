import { PolicyScopeEcole } from '../policies/PolicyScopeEcole';
import { PolicyScopeOrganisation } from '../policies/PolicyScopeOrganisation';
import { PolicyScopeSection } from '../policies/PolicyScopeSection';

// Ce moteur centralise la verification des portees organisation, ecole et section.
export class MoteurScope {
  public verifierOrganisation(organisationsAutorisees: readonly string[], idOrganisation?: string): void {
    PolicyScopeOrganisation.verifier(organisationsAutorisees, idOrganisation);
  }

  public verifierEcole(ecolesAutorisees: readonly string[], idEcole?: string): void {
    PolicyScopeEcole.verifier(ecolesAutorisees, idEcole);
  }

  public verifierSection(sectionsAutorisees: readonly string[], idSection?: string): void {
    PolicyScopeSection.verifier(sectionsAutorisees, idSection);
  }
}
