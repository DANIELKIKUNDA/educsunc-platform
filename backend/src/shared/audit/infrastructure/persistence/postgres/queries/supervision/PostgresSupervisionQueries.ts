import type {
  DetectAbnormalActivitiesQuery,
} from '../../../../../application/queries/supervision';
import type { AuditAnalyticsQuery } from '../../../../../application/dto/queries/AuditAnalyticsQuery';
import type { AbnormalActivityReadModel } from '../../../../../application/read-models/supervision/AbnormalActivityReadModel';
import type { CrossTenantAlertReadModel } from '../../../../../application/read-models/supervision/CrossTenantAlertReadModel';
import type { MassiveExportDetectionReadModel } from '../../../../../application/read-models/supervision/MassiveExportDetectionReadModel';
import type { SecurityAlertReadModel } from '../../../../../application/read-models/supervision/SecurityAlertReadModel';
import { versFiltresAnalytics } from '../query-helpers';

export class PostgresSupervisionQueries implements
  DetectAbnormalActivitiesQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'searchRepository' | 'exportRepository'>) {}

  public async executer(_filtres: AuditAnalyticsQuery): Promise<AbnormalActivityReadModel> {
    const resultat = await this.deps.searchRepository.rechercher({ graviteAudit: 'CRITIQUE' }, { page: 1, taillePage: 1 });
    const entree = resultat.resultats[0];
    return {
      acteurId: entree?.obtenirActeurAudit().obtenirIdUtilisateur(),
      resume: entree ? `Activité critique détectée: ${entree.obtenirActionAudit().obtenirValeur()}` : 'Aucune activité anormale détectée.',
    };
  }

  public async executerCrossTenant(filtres: AuditAnalyticsQuery): Promise<CrossTenantAlertReadModel> {
    const resultat = await this.deps.searchRepository.rechercher(versFiltresAnalytics(filtres), { page: 1, taillePage: 500 });
    const tenants = new Set(resultat.resultats.map((entree) => `${entree.obtenirTenantAudit().obtenirOrganisationId() ?? ''}:${entree.obtenirTenantAudit().obtenirEcoleId() ?? ''}`));
    return {
      organisationId: filtres.organisationId,
      ecoleId: filtres.ecoleId,
      message: tenants.size > 1 ? 'Activités multi-tenant corrélées détectées.' : 'Aucune fuite cross-tenant détectée.',
    };
  }

  public async executerExportsMassifs(filtres: AuditAnalyticsQuery): Promise<MassiveExportDetectionReadModel> {
    const exports = await this.deps.exportRepository.listerExports({ organisationId: filtres.organisationId, ecoleId: filtres.ecoleId });
    const massif = exports.sort((a, b) => b.nombreElements - a.nombreElements)[0];
    return {
      exportId: massif?.idAuditExport,
      totalLignes: massif?.nombreElements,
      gravite: massif && massif.nombreElements >= 1000 ? 'CRITIQUE' : 'INFO',
    };
  }

  public async executerEchecsRepetees(filtres: AuditAnalyticsQuery): Promise<SecurityAlertReadModel> {
    const resultat = await this.deps.searchRepository.rechercher({
      ...versFiltresAnalytics(filtres),
      resultatAudit: 'REFUS',
    }, { page: 1, taillePage: 500 });
    const premier = resultat.resultats[0];
    return {
      code: resultat.total >= 3 ? 'ECHECS_REPETES' : 'RAS',
      message: resultat.total >= 3 ? `${resultat.total} échecs refus détectés.` : 'Aucun échec répété détecté.',
      gravite: resultat.total >= 3 ? 'ALERTE' : 'INFO',
      correlationId: premier?.obtenirAuditCorrelation()?.obtenirCorrelationId()?.obtenirValeur(),
      organisationId: premier?.obtenirTenantAudit().obtenirOrganisationId(),
      ecoleId: premier?.obtenirTenantAudit().obtenirEcoleId(),
    };
  }
}
