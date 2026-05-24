import type {
  GetAuditStatisticsQuery,
} from '../../../../../application/queries/analytics';
import type { AuditAnalyticsQuery } from '../../../../../application/dto/queries/AuditAnalyticsQuery';
import type { AuditStatisticsReadModel } from '../../../../../application/read-models/analytics/AuditStatisticsReadModel';
import type { AuditVolumeReadModel } from '../../../../../application/read-models/analytics/AuditVolumeReadModel';
import type { ExportStatisticsReadModel } from '../../../../../application/read-models/analytics/ExportStatisticsReadModel';
import type { SecurityAuditStatisticsReadModel } from '../../../../../application/read-models/analytics/SecurityAuditStatisticsReadModel';
import type { SynchronizationStatisticsReadModel } from '../../../../../application/read-models/analytics/SynchronizationStatisticsReadModel';
import { versFiltresAnalytics } from '../query-helpers';

export class PostgresAnalyticsQueries implements
  GetAuditStatisticsQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'analyticsRepository' | 'exportRepository' | 'offlineRepository' | 'searchRepository'>) {}

  public async executer(filtres: AuditAnalyticsQuery): Promise<AuditStatisticsReadModel> {
    const valeurs = await this.deps.analyticsRepository.calculerStatistiques(versFiltresAnalytics(filtres) as Record<string, unknown>);
    return { valeurs: valeurs as Record<string, number> };
  }

  public async executerVolume(filtres: AuditAnalyticsQuery): Promise<AuditVolumeReadModel> {
    const volumetrie = await this.deps.analyticsRepository.calculerVolumetrieTenant({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
    });
    return {
      total: typeof volumetrie.totalAudits === 'number' ? volumetrie.totalAudits : 0,
      partition: filtres.periode,
    };
  }

  public async executerExports(filtres: AuditAnalyticsQuery): Promise<ExportStatisticsReadModel> {
    const exports = await this.deps.exportRepository.listerExports({
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
    });
    return {
      totalExports: exports.length,
      exportsSensibles: exports.filter((ligne) => ligne.nombreElements >= 1000 || ligne.formatExport === 'PDF').length,
    };
  }

  public async executerSecurite(filtres: AuditAnalyticsQuery): Promise<SecurityAuditStatisticsReadModel> {
    const resultat = await this.deps.searchRepository.rechercher({
      ...versFiltresAnalytics(filtres),
      categorieAudit: 'SECURITE',
    }, { page: 1, taillePage: 500 });
    return {
      refus: resultat.resultats.filter((entree) => entree.obtenirResultatAudit().obtenirValeur() === 'REFUSED').length,
      alertes: resultat.resultats.filter((entree) => entree.obtenirGraviteAudit().obtenirValeur() === 'CRITIQUE').length,
    };
  }

  public async executerSynchronisation(_filtres: AuditAnalyticsQuery): Promise<SynchronizationStatisticsReadModel> {
    const synchronises = await this.deps.offlineRepository.listerSynchronisations();
    const conflits = await this.deps.offlineRepository.listerConflits();
    const retries = await this.deps.offlineRepository.listerRetries();
    return {
      synchronises: synchronises.length,
      conflits: conflits.length,
      retries: retries.length,
    };
  }
}
