import { ContexteTenant } from 'shared/tenancy/TenantContext';

// Ce fichier adapte le contexte tenant shared aux besoins techniques du BC Bulletins.
export class BulletinTenantResolver {
  // Ce constructeur injecte le contexte transverse de tenant.
  constructor(private readonly contexteTenant: ContexteTenant) {}

  // Cette methode retourne l'ecole courante a utiliser pour filtrer les operations locales.
  public obtenirIdEcoleCourante(): string {
    return this.contexteTenant.obtenirTenant();
  }

  // Cette methode expose l'organisation courante lorsqu'une lecture transverse est permise.
  public obtenirIdOrganisationCourante(): string | null {
    return this.contexteTenant.obtenirOrganisation();
  }
}
