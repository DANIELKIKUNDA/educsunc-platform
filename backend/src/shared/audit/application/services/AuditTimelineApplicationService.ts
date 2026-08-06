import type { AuditTimelineQuery } from '../dto/queries/AuditTimelineQuery';
import type { AuditTimelineOutput } from '../dto/outputs/AuditTimelineOutput';
import { AuditEntryMapper } from '../mappers/AuditEntryMapper';
import { AuditTimelineMapper } from '../mappers/AuditTimelineMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditTimelineApplicationService {
  private construireEvenement(query: AuditTimelineQuery, action: string) {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action,
      typePrincipal: 'TIMELINE',
      resultat: 'SUCCES',
      acteur: { idUtilisateur: query.acteurId, typeActeur: 'UTILISATEUR' },
      ressource: query.ressourceId ? { typeRessource: 'RESSOURCE', idRessource: query.ressourceId } : undefined,
      contexte: { sourceAudit: 'TIMELINE', modeOffline: false, correlationId: query.correlationId },
      tenant: {
        organisationId: query.organisationId,
        ecoleId: query.ecoleId,
        scope: query.ecoleId
          ? 'ECOLE'
          : query.organisationId
            ? 'ORGANISATION'
            : 'PLATEFORME',
      },
      metadata: { workflowId: query.workflowId },
    });
  }

  public async obtenirTimelineAudit(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return AuditTimelineMapper.versTimelineOutput(payload, [this.construireEvenement(payload, 'TIMELINE_AUDIT')]);
  }
  public async obtenirTimelineRessource(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return AuditTimelineMapper.versTimelineOutput(payload, [this.construireEvenement(payload, 'TIMELINE_RESSOURCE')]);
  }
  public async obtenirTimelineActeur(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return AuditTimelineMapper.versTimelineOutput(payload, [this.construireEvenement(payload, 'TIMELINE_ACTEUR')]);
  }
  public async obtenirTimelineWorkflow(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return AuditTimelineMapper.versTimelineOutput(payload, [this.construireEvenement(payload, 'TIMELINE_WORKFLOW')]);
  }
}
