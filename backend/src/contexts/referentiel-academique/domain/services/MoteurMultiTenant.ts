import { Ecole } from '../aggregates/Ecole';
import { ErreurAccesTenant } from '../exceptions/ErreurAccesTenant';
import { ErreurIsolationDonnees } from '../exceptions/ErreurIsolationDonnees';
import { EcoleId } from '../value-objects/EcoleId';
import { ContexteTenant } from '../../../../shared/tenancy/TenantContext';

// Cette interface decrit le resultat d'un controle d'isolation multi-tenant.
export interface ResumeIsolationTenant {
  idTenantCourant: string;
  idEcoleCible: string;
  lectureOrganisationnelle: boolean;
}

// Ce moteur garantit l'isolation stricte des ecoles et des lectures organisationnelles.
export class MoteurMultiTenant {
  // Cette methode verifie que le tenant courant correspond bien a l'ecole manipulee.
  public validerRattachementEcole(ecole: Ecole, contexteTenant: ContexteTenant): void {
    const idTenantCourant = contexteTenant.obtenirTenant();
    const idEcole = ecole.obtenirId().obtenirValeur();

    if (idTenantCourant !== idEcole) {
      throw new ErreurAccesTenant(
        'Le tenant courant ne correspond pas a l ecole ciblee.',
      );
    }
  }

  // Cette methode controle l'acces a une donnee en fonction du tenant courant.
  public controlerAccesDonnees(idEcoleCible: EcoleId, contexteTenant: ContexteTenant): void {
    const idTenantCourant = contexteTenant.obtenirTenant();

    if (idTenantCourant !== idEcoleCible.obtenirValeur()) {
      throw new ErreurAccesTenant(
        'Le contexte courant ne peut pas acceder aux donnees d une autre ecole.',
      );
    }
  }

  // Cette methode garantit l'isolation complete, y compris en lecture organisationnelle.
  public garantirIsolation(
    ecole: Ecole,
    contexteTenant: ContexteTenant,
    estLectureSeule = true,
  ): ResumeIsolationTenant {
    const idTenantCourant = contexteTenant.obtenirTenant();
    const lectureOrganisationnelle = contexteTenant.estEnLectureOrganisationnelle();
    const idEcoleCible = ecole.obtenirId().obtenirValeur();

    if (!lectureOrganisationnelle) {
      if (idTenantCourant !== idEcoleCible) {
        throw new ErreurIsolationDonnees(
          'Le tenant courant doit correspondre strictement a l ecole ciblee.',
        );
      }
    } else {
      const idOrganisationCourante = contexteTenant.obtenirOrganisation();

      if (idOrganisationCourante === null) {
        throw new ErreurIsolationDonnees(
          "Une lecture organisationnelle exige un identifiant d'organisation explicite.",
        );
      }

      if (idOrganisationCourante !== ecole.obtenirOrganisationId().obtenirValeur()) {
        throw new ErreurIsolationDonnees(
          "L'organisation du contexte ne correspond pas a celle de l'ecole ciblee.",
        );
      }

      this.autoriserOperationOrganisationnelle(contexteTenant, estLectureSeule);
    }

    return {
      idTenantCourant,
      idEcoleCible,
      lectureOrganisationnelle,
    };
  }

  // Cette methode interdit toute ecriture sous couverture d'une lecture organisationnelle.
  public autoriserOperationOrganisationnelle(
    contexteTenant: ContexteTenant,
    estLectureSeule: boolean,
  ): void {
    if (contexteTenant.estEnLectureOrganisationnelle() && !estLectureSeule) {
      throw new ErreurIsolationDonnees(
        'Une agrégation organisationnelle ne peut etre utilisee que pour une lecture seule.',
      );
    }
  }
}
