import { ContexteTenant } from '../../../../shared/tenancy/TenantContext';

export interface EtatTenantPaiement {
  idOrganisation: string | null;
  idEcole: string | null;
  idUtilisateur: string | null;
  lectureOrganisationnelle: boolean;
}

// Ce fichier specialise le contexte tenant shared pour les controles propres au BC Paiements.
export class PaiementTenantContext {
  private idUtilisateurCourant: string | null = null;

  // Ce constructeur garde le contexte shared comme source de verite transverse.
  constructor(
    private readonly contexteTenantShared: ContexteTenant = new ContexteTenant(),
  ) {}

  // Cette methode definit l'ecole courante pour une operation locale de paiement.
  public definirEcoleCourante(
    idOrganisation: string,
    idEcole: string,
    idUtilisateur?: string,
  ): void {
    this.contexteTenantShared.definirOrganisation(idOrganisation);
    this.contexteTenantShared.definirTenant(idEcole);
    this.contexteTenantShared.desactiverLectureOrganisationnelle();
    this.idUtilisateurCourant = idUtilisateur?.trim() || null;
  }

  // Cette methode active une lecture organisationnelle sans autoriser les ecritures locales.
  public definirLectureOrganisationnelle(
    idOrganisation: string,
    idUtilisateur?: string,
  ): void {
    this.contexteTenantShared.definirOrganisation(idOrganisation);
    this.contexteTenantShared.activerLectureOrganisationnelle();
    this.idUtilisateurCourant = idUtilisateur?.trim() || null;
  }

  // Cette methode expose un etat simple que les depots et validateurs peuvent consommer.
  public obtenirEtatCourant(): EtatTenantPaiement {
    return {
      idOrganisation: this.contexteTenantShared.obtenirOrganisation(),
      idEcole: this.contexteTenantShared.estEnLectureOrganisationnelle()
        ? null
        : this.contexteTenantShared.obtenirTenant(),
      idUtilisateur: this.idUtilisateurCourant,
      lectureOrganisationnelle:
        this.contexteTenantShared.estEnLectureOrganisationnelle(),
    };
  }

  // Cette methode verifie qu'une ecriture locale ne sort pas de l'ecole courante.
  public verifierEcritureAutorisee(idEcole: string): void {
    const etat = this.obtenirEtatCourant();

    if (etat.lectureOrganisationnelle) {
      throw new Error(
        'Une lecture organisationnelle ne peut pas etre reutilisee pour une ecriture de paiement.',
      );
    }

    if (etat.idEcole === null || etat.idEcole !== idEcole) {
      throw new Error("L'ecriture paiement cible une autre ecole.");
    }
  }

  // Cette methode nettoie completement le contexte tenant apres usage.
  public reinitialiser(): void {
    this.contexteTenantShared.reinitialiserTenant();
    this.idUtilisateurCourant = null;
  }
}
