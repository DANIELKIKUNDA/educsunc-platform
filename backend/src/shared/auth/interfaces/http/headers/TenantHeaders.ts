// Ce helper centralise les noms de headers tenant utilises par AUTH.
export class TenantHeaders {
  public static readonly ORGANISATION = 'x-tenant-organisation-id';
  public static readonly ECOLE = 'x-tenant-ecole-id';

  // Cette methode lit les deux headers de contexte tenant.
  public static extraire(headers: unknown): { organisationActiveId?: string; ecoleActiveId?: string } {
    if (typeof headers !== 'object' || headers === null) {
      return {};
    }

    const dictionnaire = headers as Record<string, unknown>;
    const organisationActiveId =
      typeof dictionnaire[this.ORGANISATION] === 'string'
        ? String(dictionnaire[this.ORGANISATION]).trim()
        : undefined;
    const ecoleActiveId =
      typeof dictionnaire[this.ECOLE] === 'string'
        ? String(dictionnaire[this.ECOLE]).trim()
        : undefined;

    return {
      organisationActiveId: organisationActiveId || undefined,
      ecoleActiveId: ecoleActiveId || undefined,
    };
  }
}
