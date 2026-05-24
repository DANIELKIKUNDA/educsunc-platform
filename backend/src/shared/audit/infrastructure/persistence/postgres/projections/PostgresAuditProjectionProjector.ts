import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditProjectionRecord, AuditProjectionRepository } from '../../../../domain/repositories';
import { AnalyticsProjectionBuilder } from './AnalyticsProjectionBuilder';
import { ExportProjectionBuilder } from './ExportProjectionBuilder';
import { ForensicProjectionBuilder } from './ForensicProjectionBuilder';
import { OfflineSyncProjectionBuilder } from './OfflineSyncProjectionBuilder';
import { SecurityProjectionBuilder } from './SecurityProjectionBuilder';
import { SupervisionProjectionBuilder } from './SupervisionProjectionBuilder';
import { TenantActivityProjectionBuilder } from './TenantActivityProjectionBuilder';
import { TimelineProjectionBuilder } from './TimelineProjectionBuilder';
import { UserActivityProjectionBuilder } from './UserActivityProjectionBuilder';
import { VolumetryProjectionBuilder } from './VolumetryProjectionBuilder';

// Ce projecteur orchestre les vues rapides sans remplacer la source de verite append-only.
export class PostgresAuditProjectionProjector {
  private readonly timelineBuilder = new TimelineProjectionBuilder();
  private readonly securityBuilder = new SecurityProjectionBuilder();
  private readonly analyticsBuilder = new AnalyticsProjectionBuilder();
  private readonly exportBuilder = new ExportProjectionBuilder();
  private readonly offlineSyncBuilder = new OfflineSyncProjectionBuilder();
  private readonly supervisionBuilder = new SupervisionProjectionBuilder();
  private readonly forensicBuilder = new ForensicProjectionBuilder();
  private readonly userActivityBuilder = new UserActivityProjectionBuilder();
  private readonly tenantActivityBuilder = new TenantActivityProjectionBuilder();
  private readonly volumetryBuilder = new VolumetryProjectionBuilder();

  constructor(private readonly projectionRepository: AuditProjectionRepository) {}

  public construire(entree: AuditEntry): AuditProjectionRecord[] {
    return [
      this.timelineBuilder.construire(entree).projection,
      this.analyticsBuilder.construire(entree).projection,
      this.volumetryBuilder.construire(entree).projection,
      this.securityBuilder.construire(entree)?.projection,
      this.exportBuilder.construire(entree)?.projection,
      this.offlineSyncBuilder.construire(entree)?.projection,
      this.supervisionBuilder.construire(entree)?.projection,
      this.forensicBuilder.construire(entree)?.projection,
      this.userActivityBuilder.construire(entree)?.projection,
      this.tenantActivityBuilder.construire(entree)?.projection,
    ].filter((projection): projection is AuditProjectionRecord => typeof projection !== 'undefined');
  }

  public async projeter(entree: AuditEntry): Promise<AuditProjectionRecord[]> {
    const projections = this.construire(entree);
    for (const projection of projections) {
      await this.projectionRepository.enregistrerProjection(projection);
    }
    return projections;
  }
}

