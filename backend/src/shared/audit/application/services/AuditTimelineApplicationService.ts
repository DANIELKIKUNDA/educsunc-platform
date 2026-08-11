import type { AuditTimelineQuery } from '../dto/queries/AuditTimelineQuery';
import type { AuditTimelineOutput } from '../dto/outputs/AuditTimelineOutput';
import type { AuditReadFilters, AuditReadRepositoryPort } from '../ports/outbound/AuditReadRepositoryPort';
import { AuditReadCursorCodec } from './AuditReadCursorCodec';

export class AuditTimelineApplicationService {
  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly curseurs = new AuditReadCursorCodec(),
  ) {}

  public async obtenirTimelineAudit(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.obtenir(payload);
  }

  public async obtenirTimelineRessource(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.obtenir(payload);
  }

  public async obtenirTimelineActeur(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.obtenir(payload);
  }

  public async obtenirTimelineWorkflow(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.obtenir(payload);
  }

  private async obtenir(query: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    const filtres: AuditReadFilters = {
      organisationId: query.organisationId,
      ecoleId: query.ecoleId,
      scope: query.ecoleId ? 'ECOLE' : query.organisationId ? 'ORGANISATION' : 'PLATEFORME',
      correlationId: query.correlationId ?? query.workflowId,
      categorieAudit: query.categorieAudit,
      acteurId: query.acteurId,
      ressourceId: query.ressourceId,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
    };
    const limite = Math.min(query.taillePage ?? 25, 100);
    const empreinte = this.curseurs.empreinte(filtres);
    const position = this.curseurs.decoder(query.cursor, empreinte);
    const resultat = await this.lectures.rechercher(filtres, { limite, position });
    const dernier = resultat.items.at(-1);
    return {
      correlationId: query.correlationId,
      acteur: query.acteurId,
      ressource: query.ressourceId,
      timeline: resultat.items,
      items: resultat.items,
      hasNextPage: resultat.hasNextPage,
      nextCursor: resultat.hasNextPage && dernier
        ? this.curseurs.encoder({ dateAction: dernier.dateAction, idAuditEntry: dernier.idAuditEntry }, empreinte)
        : undefined,
    };
  }
}
