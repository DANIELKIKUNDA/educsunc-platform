import { ContexteActifAuth } from '../aggregates/ContexteActifAuth';
import { PolicyMultiEcole } from '../policies/PolicyMultiEcole';
import { PolicyMultiOrganisation } from '../policies/PolicyMultiOrganisation';

// Ce moteur porte la logique de changement du contexte actif multi-tenant.
export class MoteurContexteActif {
  // Cette methode change l'organisation active si l'utilisateur y a acces.
  public changerOrganisationActive(
    contexteActif: ContexteActifAuth,
    organisationActiveId: string | undefined,
    organisationsAutorisees: readonly string[],
  ): void {
    PolicyMultiOrganisation.verifier(organisationsAutorisees, organisationActiveId);
    contexteActif.changerOrganisationActive(organisationActiveId);
  }

  // Cette methode change l'ecole active si elle reste autorisee et coherente.
  public changerEcoleActive(
    contexteActif: ContexteActifAuth,
    ecoleActiveId: string | undefined,
    ecolesAutorisees: readonly string[],
    ecoleAppartientOrganisation = true,
  ): void {
    PolicyMultiEcole.verifier(ecolesAutorisees, ecoleActiveId);
    contexteActif.changerEcoleActive(ecoleActiveId, ecoleAppartientOrganisation);
  }

  // Cette methode verifie la coherence globale du contexte actif.
  public verifierCoherence(
    organisationsAutorisees: readonly string[],
    ecolesAutorisees: readonly string[],
    organisationActiveId?: string,
    ecoleActiveId?: string,
  ): void {
    PolicyMultiOrganisation.verifier(organisationsAutorisees, organisationActiveId);
    PolicyMultiEcole.verifier(ecolesAutorisees, ecoleActiveId);
  }
}
