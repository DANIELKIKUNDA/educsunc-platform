import type { SearchAuditQuery } from '../dto/queries/SearchAuditQuery';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import type { AuditSearchResultOutput } from '../dto/outputs/AuditSearchResultOutput';
import { AuditEntryMapper } from '../mappers/AuditEntryMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditSearchApplicationService {
  private construireSortie(query: SearchAuditQuery, items: readonly AuditEntryOutput[] = []): AuditSearchResultOutput {
    const page = query.page ?? 1;
    const taille = query.taillePage ?? 25;
    const total = items.length;
    return {
      total,
      page,
      taillePage: taille,
      totalPages: total === 0 ? 0 : Math.ceil(total / taille),
      items,
      pagination: { page, taille, total, totalPages: total === 0 ? 0 : Math.ceil(total / taille) },
    };
  }

  private construireAuditMinimal(query: SearchAuditQuery): AuditEntryOutput {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: query.action ?? 'AUDIT_CONSULTE',
      typePrincipal: query.typeAuditPrincipal ?? 'RECHERCHE',
      resultat: query.resultat ?? 'SUCCES',
      categories: query.gravite ? [query.gravite] : ['RECHERCHE'],
      acteur: { idUtilisateur: query.acteurId, typeActeur: 'UTILISATEUR' },
      ressource: query.ressourceId ? { typeRessource: 'RESSOURCE', idRessource: query.ressourceId } : undefined,
      contexte: { sourceAudit: 'SEARCH', modeOffline: false, correlationId: query.correlationId },
      tenant: { organisationId: query.organisationId, ecoleId: query.ecoleId, scope: query.ecoleId ? 'ECOLE' : 'ORGANISATION' },
    });
  }

  public async rechercherAudits(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.construireSortie(payload, []);
  }
  public async rechercherAuditsCritiques(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.construireSortie(payload, payload.gravite ? [this.construireAuditMinimal(payload)] : []);
  }
  public async rechercherParActeur(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.construireSortie(payload, payload.acteurId ? [this.construireAuditMinimal(payload)] : []);
  }
  public async rechercherParRessource(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.construireSortie(payload, payload.ressourceId ? [this.construireAuditMinimal(payload)] : []);
  }
  public async rechercherParCorrelation(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.construireSortie(payload, payload.correlationId ? [this.construireAuditMinimal(payload)] : []);
  }
  public async consulterAudit(payload: SearchAuditQuery): Promise<AuditEntryOutput> {
    return this.construireAuditMinimal(payload);
  }
  public async consulterHistoriqueRessource(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercherParRessource(payload);
  }
  public async consulterHistoriqueActeur(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercherParActeur(payload);
  }
}
