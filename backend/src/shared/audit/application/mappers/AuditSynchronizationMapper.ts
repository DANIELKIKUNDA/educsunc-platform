import type { CreateSynchronizationAuditInput } from '../dto/inputs/CreateSynchronizationAuditInput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditSynchronizationMapper {
  public static depuisSynchronizationInput(valeur: CreateSynchronizationAuditInput): Record<string, unknown> {
    return {
      replay: valeur.replay ?? false,
      retry: valeur.retry ?? false,
      conflit: valeur.conflit ?? false,
    };
  }
}
