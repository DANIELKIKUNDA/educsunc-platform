import { Ecole } from '../aggregates/Ecole';
import { ErreurAccesTenant } from '../exceptions/ErreurAccesTenant';
import { ErreurIsolationDonnees } from '../exceptions/ErreurIsolationDonnees';
import { ContexteIsolationTenant } from '../services/ContexteIsolationTenant';

// Cette policy porte les regles globales d'isolation stricte entre tenants et organisations.
export class PolicyMultiTenant {
  // Cette methode verifie qu'une ecole reste strictement accessible dans son tenant attendu.
  public verifierIsolationStricte(contexteTenant: ContexteIsolationTenant, ecole: Ecole): void {
    const tenantCourant = contexteTenant.obtenirTenant();
    const tenantEcole = ecole.obtenirId().obtenirValeur();

    if (tenantCourant !== tenantEcole) {
      throw new ErreurAccesTenant(
        'Le tenant courant ne correspond pas a l ecole ciblee.',
      );
    }

    if (contexteTenant.estEnLectureOrganisationnelle()) {
      const organisationCourante = contexteTenant.obtenirOrganisation();

      if (
        organisationCourante === null
        || organisationCourante !== ecole.obtenirOrganisationId().obtenirValeur()
      ) {
        throw new ErreurIsolationDonnees(
          'La lecture organisationnelle doit rester limitee a l organisation attendue.',
        );
      }
    }
  }

  // Cette methode verifie qu'aucune lecture ou ecriture ne fuit vers une autre ecole.
  public verifierAbsenceFuiteDonnees(
    contexteTenant: ContexteIsolationTenant,
    identifiantEcoleCible: string,
  ): void {
    const identifiantNettoye = identifiantEcoleCible.trim();

    if (identifiantNettoye.length === 0) {
      throw new ErreurIsolationDonnees(
        'L identifiant de l ecole ciblee est obligatoire pour verifier l isolation.',
      );
    }

    if (contexteTenant.obtenirTenant() !== identifiantNettoye) {
      throw new ErreurIsolationDonnees(
        'Aucune fuite de donnees inter-ecoles n est autorisee.',
      );
    }
  }
}
