// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditActorMapper {
  public static depuisActeur(valeur: Record<string, unknown> | undefined): { idUtilisateur?: string; typeActeur: string; roleActif?: string } {
    return {
      idUtilisateur: typeof valeur?.idUtilisateur === 'string' ? valeur.idUtilisateur : undefined,
      typeActeur: typeof valeur?.typeActeur === 'string' ? valeur.typeActeur : 'SYSTEME',
      roleActif: typeof valeur?.roleActif === 'string' ? valeur.roleActif : undefined,
    };
  }

  public static versLecture(valeur: Record<string, unknown> | undefined): Record<string, unknown> {
    return this.depuisActeur(valeur);
  }
}
