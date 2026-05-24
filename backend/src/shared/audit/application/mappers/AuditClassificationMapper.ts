// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditClassificationMapper {
  public static determinerClassification(action: string, typePrincipal: string, categories?: readonly string[], gravite?: string, niveau?: string): { categories: readonly string[]; gravite: string; niveau: string } {
    const categoriesNormalisees = categories && categories.length > 0 ? [...categories] : [typePrincipal || 'GENERAL'];
    return {
      categories: categoriesNormalisees,
      gravite: gravite ?? (action.includes('FAILED') || action.includes('REFUSE') ? 'AVERTISSEMENT' : 'INFO'),
      niveau: niveau ?? (typePrincipal || 'STANDARD'),
    };
  }
}
