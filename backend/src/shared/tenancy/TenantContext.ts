import { ErreurTenantAbsent } from './exceptions/ErreurTenantAbsent';
import { ErreurTenantInvalide } from './exceptions/ErreurTenantInvalide';

// Ce contexte centralise l'etat technique du tenant courant pour une requete ou une execution donnee.
// Il distingue l'identifiant du tenant opere et un mode de lecture organisationnelle plus large.
export class ContexteTenant {
  private idTenantCourant: string | null = null;
  private idOrganisationCourante: string | null = null;
  private modeLectureOrganisationnelle = false;

  // Cette methode verifie qu'un identifiant technique est present et exploitable.
  private validerIdentifiant(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurTenantInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }

  // Cette methode definit le tenant courant a utiliser par les composants transversaux.
  public definirTenant(idTenant: string): void {
    this.idTenantCourant = this.validerIdentifiant(idTenant, 'idTenant');
  }

  // Cette methode retourne le tenant courant et signale explicitement son absence si necessaire.
  public obtenirTenant(): string {
    if (this.idTenantCourant === null) {
      throw new ErreurTenantAbsent();
    }

    return this.idTenantCourant;
  }

  // Cette methode nettoie completement le contexte pour eviter toute fuite entre executions.
  public reinitialiserTenant(): void {
    this.idTenantCourant = null;
    this.idOrganisationCourante = null;
    this.modeLectureOrganisationnelle = false;
  }

  // Cette methode definit l'organisation courante quand une lecture transverse est necessaire.
  public definirOrganisation(idOrganisation: string): void {
    this.idOrganisationCourante = this.validerIdentifiant(idOrganisation, 'idOrganisation');
  }

  // Cette methode retourne l'identifiant d'organisation s'il est present dans le contexte.
  public obtenirOrganisation(): string | null {
    return this.idOrganisationCourante;
  }

  // Cette methode active le mode de lecture organisationnelle transverse.
  public activerLectureOrganisationnelle(): void {
    this.modeLectureOrganisationnelle = true;
  }

  // Cette methode desactive le mode de lecture organisationnelle transverse.
  public desactiverLectureOrganisationnelle(): void {
    this.modeLectureOrganisationnelle = false;
  }

  // Cette methode indique si le contexte opere dans un mode de lecture organisationnelle.
  public estEnLectureOrganisationnelle(): boolean {
    return this.modeLectureOrganisationnelle;
  }
}
