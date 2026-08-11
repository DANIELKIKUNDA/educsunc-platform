import type { AuditAnalyticsQuery } from '../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../dto/outputs/AuditAnalyticsOutput';
import type { AuditReadFilters, AuditReadRepositoryPort } from '../ports/outbound/AuditReadRepositoryPort';
import { AuditAnalyticsMapper } from '../mappers/AuditAnalyticsMapper';

export class AuditAnalyticsApplicationService {
  public constructor(private readonly lectures: AuditReadRepositoryPort) {}

  public async obtenirStatistiquesAudit(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    const statistiques = await this.lectures.compter(this.filtres(payload));
    return AuditAnalyticsMapper.versAnalyticsOutput(payload, {
      audits: statistiques.total,
      critiques: statistiques.critiques,
      echecs: statistiques.echecs,
    });
  }

  public async obtenirVolumetrieAudit(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    const statistiques = await this.lectures.compter(this.filtres(payload));
    return AuditAnalyticsMapper.versAnalyticsOutput(payload, { lignes: statistiques.total });
  }

  public async obtenirStatistiquesSecurite(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    const statistiques = await this.lectures.compter(this.filtres(payload));
    return AuditAnalyticsMapper.versAnalyticsOutput(payload, {
      refus: statistiques.echecs,
      alertes: statistiques.securite,
    });
  }

  public async obtenirStatistiquesExports(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    const statistiques = await this.lectures.compter(this.filtres(payload));
    return AuditAnalyticsMapper.versAnalyticsOutput(payload, { exports: statistiques.exports });
  }

  public async obtenirStatistiquesSynchronisation(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    const statistiques = await this.lectures.compter(this.filtres(payload));
    return AuditAnalyticsMapper.versAnalyticsOutput(payload, {
      replays: statistiques.replays,
      retries: statistiques.retries,
    });
  }

  private filtres(payload: AuditAnalyticsQuery): AuditReadFilters {
    return {
      organisationId: payload.organisationId,
      ecoleId: payload.ecoleId,
      scope: payload.ecoleId ? 'ECOLE' : payload.organisationId ? 'ORGANISATION' : 'PLATEFORME',
      typeAuditPrincipal: payload.typeAuditPrincipal,
    };
  }
}
