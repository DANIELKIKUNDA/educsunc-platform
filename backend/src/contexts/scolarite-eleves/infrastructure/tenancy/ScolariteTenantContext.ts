import { ContexteTenant } from '../../../../shared/tenancy/TenantContext';
import { ErreurTenantApplication } from '../../application/exceptions/ErreurTenantApplication';

// Ce fichier specialise le TenantContext shared pour le BC Scolarite des Eleves.
export interface EtatTenantScolarite {
  idOrganisation: string;
  idEcole: string;
  lectureOrganisationnelle: boolean;
}

/**
 * Ce contexte garde le double niveau organisation/ecole requis par les depots du BC.
 */
export class ScolariteTenantContext {
  constructor(private readonly contexteTenantShared: ContexteTenant = new ContexteTenant()) {}

  /** Definit le tenant local d'une ecole. */
  public definirEcoleCourante(idOrganisation: string, idEcole: string): void {
    this.contexteTenantShared.definirOrganisation(idOrganisation);
    this.contexteTenantShared.definirTenant(idEcole);
    this.contexteTenantShared.desactiverLectureOrganisationnelle();
  }

  /** Active une lecture organisationnelle multi-ecoles. */
  public definirLectureOrganisationnelle(idOrganisation: string): void {
    this.contexteTenantShared.definirOrganisation(idOrganisation);
    this.contexteTenantShared.activerLectureOrganisationnelle();
  }

  /** Retourne l'etat courant sous une forme exploitable par les depots. */
  public obtenirEtatCourant(): EtatTenantScolarite {
    const idOrganisation = this.contexteTenantShared.obtenirOrganisation();

    if (idOrganisation === null) {
      throw new ErreurTenantApplication('L organisation courante est obligatoire pour la scolarite.');
    }

    if (this.contexteTenantShared.estEnLectureOrganisationnelle()) {
      return { idOrganisation, idEcole: '', lectureOrganisationnelle: true };
    }

    return {
      idOrganisation,
      idEcole: this.contexteTenantShared.obtenirTenant(),
      lectureOrganisationnelle: false,
    };
  }

  /** Verifie qu'une ecriture cible le tenant courant exact. */
  public verifierEcritureAutorisee(idOrganisation: string, idEcole: string): void {
    const etat = this.obtenirEtatCourant();

    if (etat.lectureOrganisationnelle) {
      throw new ErreurTenantApplication('Une lecture organisationnelle ne peut pas servir a une ecriture locale.');
    }

    if (etat.idOrganisation !== idOrganisation || etat.idEcole !== idEcole) {
      throw new ErreurTenantApplication('L ecriture cible une organisation ou une ecole hors tenant.');
    }
  }

  /** Nettoie le contexte apres une requete pour eviter toute fuite entre tenants. */
  public reinitialiser(): void {
    this.contexteTenantShared.reinitialiserTenant();
  }
}
