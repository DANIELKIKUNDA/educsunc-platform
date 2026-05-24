import type { AuditAnalyticsSnapshot } from '../../../../domain/repositories';
import type { AuditAnalyticsDailyRow } from './AuditPersistenceRecords';
import { AuditJsonbMapper } from './AuditJsonbMapper';
import type { AuditStatisticsReadModel } from '../../../../application/read-models/analytics/AuditStatisticsReadModel';

// Ce mapper specialise les structures analytics, distinctes des lectures forensic et timeline.
export class AuditAnalyticsMapper {
  public static versRow(snapshot: AuditAnalyticsSnapshot): AuditAnalyticsDailyRow {
    return {
      cle_analytics: snapshot.cle,
      date_reference: snapshot.dateReference,
      dimensions: AuditJsonbMapper.serialiser(snapshot.dimensions),
      compteurs: AuditJsonbMapper.serialiser(snapshot.compteurs),
    };
  }

  public static depuisRow(row: AuditAnalyticsDailyRow): AuditAnalyticsSnapshot {
    return {
      cle: row.cle_analytics,
      dateReference: row.date_reference,
      dimensions: AuditJsonbMapper.deserialiserObjet(row.dimensions) as Record<string, string | undefined>,
      compteurs: AuditJsonbMapper.deserialiserObjet(row.compteurs) as Record<string, number>,
    };
  }

  public static versReadModel(row: AuditAnalyticsDailyRow): AuditStatisticsReadModel {
    return {
      valeurs: (AuditJsonbMapper.deserialiserObjet(row.compteurs) ?? {}) as Record<string, number>,
    };
  }
}
