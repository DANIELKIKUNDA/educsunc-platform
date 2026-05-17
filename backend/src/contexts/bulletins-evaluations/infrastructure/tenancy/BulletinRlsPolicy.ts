// Ce fichier construit les parametres de session utiles aux futures policies RLS PostgreSQL.
export class BulletinRlsPolicy {
  // Cette methode prepare un dictionnaire de session SQL a injecter au demarrage d'une transaction.
  public construireParametresSession(idEcole: string, idOrganisation?: string | null): Record<string, string> {
    return {
      'app.tenant_id': idEcole,
      'app.organisation_id': idOrganisation ?? '',
    };
  }
}
