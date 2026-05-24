import type {
  InvestigateIncidentQuery,
} from '../../../../../application/queries/forensic';
import type { AuditForensicQuery } from '../../../../../application/dto/queries/AuditForensicQuery';
import type { SuspiciousActivityReadModel } from '../../../../../application/read-models/forensic/SuspiciousActivityReadModel';
import type { AuditForensicReadModel } from '../../../../../application/read-models/forensic/AuditForensicReadModel';
import type { ForensicSecurityReadModel } from '../../../../../application/read-models/forensic/ForensicSecurityReadModel';
import type { ForensicSynchronizationReadModel } from '../../../../../application/read-models/forensic/ForensicSynchronizationReadModel';
import { AuditForensicMapper } from '../../mappers/AuditForensicMapper';

export class PostgresForensicQueries implements
  InvestigateIncidentQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'forensicRepository' | 'offlineRepository'>) {}

  public async executer(filtres: AuditForensicQuery): Promise<AuditForensicReadModel> {
    const traces = await this.deps.forensicRepository.suivreWorkflow(filtres.correlationId ?? '');
    return {
      investigationId: filtres.correlationId ?? filtres.incidentId ?? 'forensic-investigation',
      resume: traces.length > 0 ? 'Investigation corrélée reconstruite.' : 'Aucune trace corrélée trouvée.',
      correlations: traces.map((trace) => AuditForensicMapper.versCorrelationReadModel(trace)),
      timelineIds: traces.map((trace) => trace.auditEntry.obtenirId()),
    };
  }

  public async executerActivitesSuspectes(filtres: AuditForensicQuery): Promise<SuspiciousActivityReadModel> {
    const traces = await this.deps.forensicRepository.listerEvenementsCritiques({
      correlationId: filtres.correlationId,
      acteurId: filtres.acteurId,
      adresseIp: filtres.adresseIp,
    });
    return {
      code: traces.length > 0 ? 'ACTIVITE_SUSPECTE' : 'RAS',
      message: traces.length > 0 ? `Activités critiques détectées: ${traces.length}` : 'Aucune activité critique détectée.',
      gravite: traces.length > 0 ? 'CRITIQUE' : 'INFO',
    };
  }

  public async executerSecurity(filtres: AuditForensicQuery): Promise<ForensicSecurityReadModel> {
    const traces = filtres.adresseIp
      ? await this.deps.forensicRepository.suivreAdresseIp(filtres.adresseIp)
      : await this.deps.forensicRepository.suivreUtilisateur(filtres.acteurId ?? '');
    return {
      acteurId: filtres.acteurId,
      adresseIp: filtres.adresseIp,
      anomalies: traces.map((trace) => trace.auditEntry.obtenirActionAudit().obtenirValeur()),
    };
  }

  public async executerSynchronisation(_filtres: AuditForensicQuery): Promise<ForensicSynchronizationReadModel> {
    const conflits = await this.deps.offlineRepository.listerConflits();
    const conflit = conflits[0];
    return {
      auditId: conflit?.idAuditEntry,
      statutSynchronisation: conflit?.statutResolution,
      conflit: Boolean(conflit),
    };
  }
}
