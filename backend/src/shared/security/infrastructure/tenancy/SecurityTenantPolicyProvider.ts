// Ce fournisseur genere les policies RLS et variables SQL utiles a SECURITY.
export class SecurityTenantPolicyProvider {
  public produirePoliciesSql(): readonly string[] {
    return [
      'ecole_id = current_ecole_id()',
      'organisation_id = current_organisation_id()',
      'scope autorise obligatoire',
      'titulaire voit uniquement sa classe',
      'enseignant voit uniquement ses cours/classes',
      'parent voit uniquement ses enfants',
    ];
  }

  public produireVariablesSession(params: {
    idOrganisation?: string;
    idEcole?: string;
  }): readonly { sql: string; parametres: readonly unknown[] }[] {
    return [
      {
        sql: 'SELECT set_config($1, $2, true)',
        parametres: ['security.current_organisation_id', params.idOrganisation ?? ''],
      },
      {
        sql: 'SELECT set_config($1, $2, true)',
        parametres: ['security.current_ecole_id', params.idEcole ?? ''],
      },
    ];
  }
}
