import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { SearchAuditQuery } from '../dto/queries/SearchAuditQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';
import type { AuditAnalyticsOutput } from '../dto/outputs/AuditAnalyticsOutput';
import { AuditForensicMapper } from '../mappers/AuditForensicMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditSecurityApplicationService {
  public async investiguerIncidentSecurite(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return { ...AuditForensicMapper.depuisForensicQuery(payload), resume: 'Investigation securite lancee' };
  }
  public async detecterEchecsSecuriteRepetees(_payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return { valeurs: { echecsRepetees: 0 }, compteurs: { alertes: 0 } };
  }
  public async detecterExportMassif(_payload: SearchAuditQuery): Promise<AuditAnalyticsOutput> {
    return { valeurs: { exportsMassifs: 0 }, compteurs: { alertes: 0 } };
  }
}
