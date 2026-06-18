import type { MonitoringContextInputDto } from '../../../application';
import type { MonitoringAuthContexteActif } from '../MonitoringAuthIntegrationTypes';

// Ce fichier declare le mapper de contexte Auth vers Monitoring.

export class MonitoringAuthContextMapper {
  public static enrichir(
    contexte: MonitoringContextInputDto,
    auth: MonitoringAuthContexteActif | null,
  ): MonitoringContextInputDto {
    return {
      ...contexte,
      utilisateurId: auth?.utilisateurId ?? contexte.utilisateurId,
    };
  }
}
