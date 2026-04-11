import { AsyncLocalStorage } from 'node:async_hooks';
import { ContexteTenant } from '../../../../shared/tenancy/TenantContext';

// Cette interface represente un resume exploitable du contexte tenant courant.
export interface EtatContexteTenantReferentielAcademique {
  idTenant: string | null;
  idOrganisation: string | null;
  lectureOrganisationnelle: boolean;
}

// Cette classe conserve un contexte tenant isole par execution HTTP ou applicative.
export class ContexteExecutionTenantReferentielAcademique {
  private readonly stockage = new AsyncLocalStorage<ContexteTenant>();

  // Cette methode execute un traitement dans un contexte tenant dedie.
  public executerAvecContexte<TValeur>(
    contexteTenant: ContexteTenant,
    operation: () => Promise<TValeur>,
  ): Promise<TValeur> {
    return this.stockage.run(contexteTenant, operation);
  }

  // Cette methode retourne le contexte tenant courant si une execution en porte un.
  public obtenirContexteCourant(): ContexteTenant | null {
    return this.stockage.getStore() ?? null;
  }

  // Cette methode indique si un tenant est actuellement defini.
  public aUnTenantCourant(): boolean {
    const contexteCourant = this.obtenirContexteCourant();

    if (contexteCourant === null) {
      return false;
    }

    try {
      void contexteCourant.obtenirTenant();
      return true;
    } catch {
      return false;
    }
  }

  // Cette methode resume le contexte courant pour les composants d'infrastructure.
  public obtenirEtatCourant(): EtatContexteTenantReferentielAcademique {
    const contexteCourant = this.obtenirContexteCourant();

    if (contexteCourant === null) {
      return {
        idTenant: null,
        idOrganisation: null,
        lectureOrganisationnelle: false,
      };
    }

    let idTenant: string | null = null;

    try {
      idTenant = contexteCourant.obtenirTenant();
    } catch {
      idTenant = null;
    }

    return {
      idTenant,
      idOrganisation: contexteCourant.obtenirOrganisation(),
      lectureOrganisationnelle: contexteCourant.estEnLectureOrganisationnelle(),
    };
  }
}
