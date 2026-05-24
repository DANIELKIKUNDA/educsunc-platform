import type {
  PrepareAuditExportQuery,
} from '../../../../../application/queries/exports';
import type { AuditExportQuery } from '../../../../../application/dto/queries/AuditExportQuery';
import type { AuditExportReadModel } from '../../../../../application/read-models/exports/AuditExportReadModel';
import type { ForensicExportReadModel } from '../../../../../application/read-models/exports/ForensicExportReadModel';
import type { TimelineExportReadModel } from '../../../../../application/read-models/exports/TimelineExportReadModel';
import { AuditExportMapper } from '../../mappers/AuditExportMapper';

export class PostgresExportQueries implements
  PrepareAuditExportQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'exportRepository' | 'forensicRepository' | 'timelineRepository'>) {}

  public async executer(filtres: AuditExportQuery): Promise<AuditExportReadModel> {
    const lignes = await this.deps.exportRepository.preparerExport(filtres.filtres ?? {}, { page: 1, taillePage: 100 });
    const premiere = lignes[0];
    return {
      exportId: premiere?.idAuditExport ?? 'EXPORT-VIDE',
      format: filtres.format,
      nombreElements: lignes.reduce((total, ligne) => total + ligne.nombreElements, 0),
      dateGeneration: premiere?.dateGeneration.toISOString() ?? new Date().toISOString(),
      items: lignes.map((ligne) => AuditExportMapper.versReadModel(AuditExportMapper.versRow(ligne))),
    };
  }

  public async executerForensic(filtres: AuditExportQuery): Promise<ForensicExportReadModel> {
    const traces = await this.deps.forensicRepository.listerEvenementsCritiques(filtres.filtres ?? {});
    return {
      exportId: traces[0]?.auditEntry.obtenirId() ?? 'FORENSIC-VIDE',
      resume: `${traces.length} trace(s) forensic prêtes pour export ${filtres.format}.`,
    };
  }

  public async executerTimeline(_filtres: AuditExportQuery): Promise<TimelineExportReadModel> {
    const timeline = await this.deps.timelineRepository.listerTimelineTenant({}, { page: 1, taillePage: 500 });
    return {
      exportId: timeline.resultats[0]?.obtenirId() ?? 'TIMELINE-VIDE',
      totalEvenements: timeline.total,
    };
  }
}
