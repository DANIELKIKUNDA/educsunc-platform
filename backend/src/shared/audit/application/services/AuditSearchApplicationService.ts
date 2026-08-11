import type { SearchAuditQuery } from '../dto/queries/SearchAuditQuery';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import type { AuditSearchResultOutput } from '../dto/outputs/AuditSearchResultOutput';
import type { AuditReadFilters, AuditReadRepositoryPort } from '../ports/outbound/AuditReadRepositoryPort';
import { AuditNotFoundException } from '../exceptions/communes/AuditNotFoundException';
import { AuditValidationException } from '../exceptions/communes/AuditValidationException';
import { AuditReadCursorCodec } from './AuditReadCursorCodec';

const LIMITE_PAR_DEFAUT = 25;
const LIMITE_MAXIMALE = 100;

export class AuditSearchApplicationService {
  public constructor(
    private readonly lectures: AuditReadRepositoryPort,
    private readonly curseurs = new AuditReadCursorCodec(),
  ) {}

  public async rechercherAudits(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercher(payload);
  }

  public async rechercherAuditsCritiques(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercher({ ...payload, gravite: payload.gravite ?? 'CRITIQUE' });
  }

  public async rechercherParActeur(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercher(payload);
  }

  public async rechercherParRessource(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercher(payload);
  }

  public async rechercherParCorrelation(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercher(payload);
  }

  public async consulterAudit(payload: SearchAuditQuery): Promise<AuditEntryOutput> {
    if (!payload.idAuditEntry) {
      throw new AuditValidationException("L'identifiant de l'evenement Audit est requis.");
    }
    const audit = await this.lectures.obtenirParId(this.construireFiltres(payload));
    if (!audit) {
      throw new AuditNotFoundException("L'evenement Audit demande est introuvable.");
    }
    return audit;
  }

  public async consulterHistoriqueRessource(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercherParRessource(payload);
  }

  public async consulterHistoriqueActeur(payload: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    return this.rechercherParActeur(payload);
  }

  private async rechercher(query: SearchAuditQuery): Promise<AuditSearchResultOutput> {
    if ((query.page ?? 1) > 1 && !query.cursor) {
      throw new AuditValidationException('Utilisez le curseur retourne par la page precedente.');
    }
    const limite = Math.min(query.taillePage ?? LIMITE_PAR_DEFAUT, LIMITE_MAXIMALE);
    const filtres = this.construireFiltres(query);
    const empreinte = this.curseurs.empreinte(filtres);
    const position = this.curseurs.decoder(query.cursor, empreinte);
    const resultat = await this.lectures.rechercher(filtres, { limite, position });
    const dernier = resultat.items.at(-1);
    const nextCursor = resultat.hasNextPage && dernier
      ? this.curseurs.encoder({ dateAction: dernier.dateAction, idAuditEntry: dernier.idAuditEntry }, empreinte)
      : undefined;
    const total = resultat.items.length;
    return {
      total,
      page: 1,
      taillePage: limite,
      totalPages: total === 0 ? 0 : 1,
      nextCursor,
      hasNextPage: resultat.hasNextPage,
      items: resultat.items,
      pagination: {
        page: 1,
        taille: limite,
        total,
        totalPages: total === 0 ? 0 : 1,
        nextCursor,
        hasNextPage: resultat.hasNextPage,
      },
    };
  }

  private construireFiltres(query: SearchAuditQuery): AuditReadFilters {
    return {
      idAuditEntry: query.idAuditEntry,
      organisationId: query.organisationId,
      ecoleId: query.ecoleId,
      scope: query.ecoleId ? 'ECOLE' : query.organisationId ? 'ORGANISATION' : 'PLATEFORME',
      acteurId: query.acteurId,
      typeAuditPrincipal: query.typeAuditPrincipal,
      categorieAudit: query.categorieAudit,
      action: query.action,
      gravite: query.gravite,
      resultat: query.resultat,
      typeRessource: query.typeRessource,
      ressourceId: query.ressourceId,
      correlationId: query.correlationId,
      requestId: query.requestId,
      sourceAudit: query.sourceAudit,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
    };
  }
}
