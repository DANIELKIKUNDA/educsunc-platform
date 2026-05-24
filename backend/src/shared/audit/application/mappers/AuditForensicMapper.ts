import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditForensicMapper {
  public static depuisForensicQuery(valeur: AuditForensicQuery): AuditForensicOutput {
    const actions = [valeur.incidentId, valeur.acteurId, valeur.adresseIp].filter((element): element is string => typeof element === 'string');
    return {
      investigationId: valeur.correlationId ?? `forensic-${Date.now()}`,
      resume: 'Investigation audit initialisee',
      correlations: [
        {
          correlationId: valeur.correlationId,
          actions,
        },
      ],
      indicateurs: {
        evenements: 0,
        alertes: actions.length,
      },
    };
  }

  public static versForensicOutput(valeur: AuditForensicOutput): AuditForensicOutput {
    return { ...valeur, correlations: [...valeur.correlations] };
  }
}
