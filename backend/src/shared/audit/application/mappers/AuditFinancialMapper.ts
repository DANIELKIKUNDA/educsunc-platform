import type { CreateFinancialAuditInput } from '../dto/inputs/CreateFinancialAuditInput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditFinancialMapper {
  public static depuisFinancialInput(valeur: CreateFinancialAuditInput): Record<string, unknown> {
    return {
      montant: valeur.montant ?? 0,
      devise: valeur.devise ?? 'USD',
      ancienEtat: valeur.ancienEtat,
      nouvelEtat: valeur.nouvelEtat,
      contexte: valeur.contexte,
    };
  }
}
