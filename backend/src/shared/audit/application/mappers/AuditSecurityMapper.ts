import type { CreateSecurityAuditInput } from '../dto/inputs/CreateSecurityAuditInput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditSecurityMapper {
  public static depuisSecurityInput(valeur: CreateSecurityAuditInput): Record<string, unknown> {
    return {
      permissionsActives: valeur.permissionsActives ?? [],
      scopesActifs: valeur.scopesActifs ?? [],
      gravite: valeur.gravite ?? 'AVERTISSEMENT',
      contexte: valeur.contexte,
    };
  }

  public static versSecurityResume(valeur: CreateSecurityAuditInput): Record<string, unknown> {
    return this.depuisSecurityInput(valeur);
  }
}
