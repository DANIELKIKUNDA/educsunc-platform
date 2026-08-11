import type { AuditForensicQuery } from '../dto/queries/AuditForensicQuery';
import type { AuditForensicOutput } from '../dto/outputs/AuditForensicOutput';
import type { AuditReadRepositoryPort } from '../ports/outbound/AuditReadRepositoryPort';

export class AuditForensicApplicationService {
  public constructor(private readonly lectures: AuditReadRepositoryPort) {}

  public async lancerInvestigation(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.investiguer(payload, 'Investigation Audit terminee');
  }

  public async reconstruireWorkflow(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.investiguer(payload, 'Workflow reconstruit');
  }

  public async detecterActionsSuspectes(payload: AuditForensicQuery): Promise<AuditForensicOutput> {
    return this.investiguer(payload, 'Actions suspectes analysees');
  }

  private async investiguer(payload: AuditForensicQuery, resume: string): Promise<AuditForensicOutput> {
    const page = await this.lectures.rechercher({
      organisationId: payload.organisationId,
      ecoleId: payload.ecoleId,
      scope: payload.ecoleId ? 'ECOLE' : payload.organisationId ? 'ORGANISATION' : 'PLATEFORME',
      correlationId: payload.correlationId,
      acteurId: payload.acteurId,
      ressourceId: payload.incidentId,
      adresseIp: payload.adresseIp,
    }, { limite: 100 });
    return {
      investigationId: payload.correlationId ?? payload.incidentId ?? 'investigation-audit',
      resume,
      correlations: [{
        correlationId: payload.correlationId,
        actions: page.items.map((item) => item.action),
      }],
      timeline: page.items,
      indicateurs: { evenements: page.items.length, suiteDisponible: page.hasNextPage ? 1 : 0 },
    };
  }
}
