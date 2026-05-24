import type {
  GetAuditEntryQuery,
} from '../../../../../application/queries/consultation';
import type { SearchAuditQuery } from '../../../../../application/dto/queries/SearchAuditQuery';
import type { AuditEntryDetailsReadModel } from '../../../../../application/read-models/consultation/AuditEntryDetailsReadModel';
import type { AuditHistoryReadModel } from '../../../../../application/read-models/consultation/AuditHistoryReadModel';
import type { SensitiveConsultationReadModel } from '../../../../../application/read-models/consultation/SensitiveConsultationReadModel';
import { AuditEntryPersistenceMapper } from '../../mappers/AuditEntryPersistenceMapper';
import { premier, versFiltresRecherche, versPagination } from '../query-helpers';

export class PostgresConsultationQueries implements
  GetAuditEntryQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'searchRepository' | 'entryRepository'>) {}

  public async executer(filtres: SearchAuditQuery): Promise<AuditEntryDetailsReadModel> {
    const resultat = await this.deps.searchRepository.rechercher(versFiltresRecherche(filtres), versPagination(filtres));
    const entree = premier(resultat.resultats);
    if (!entree) {
      return {
        audit: {
          idAuditEntry: 'AUDIT-ABSENT',
          action: filtres.action ?? 'AUDIT_CONSULTE',
          typePrincipal: filtres.typeAuditPrincipal ?? 'CONSULTATION',
          typeAuditPrincipal: filtres.typeAuditPrincipal ?? 'CONSULTATION',
          categories: ['CONSULTATION'],
          gravite: filtres.gravite ?? 'INFO',
          resultat: filtres.resultat ?? 'SUCCES',
          acteur: {},
          tenant: { organisationId: filtres.organisationId, ecoleId: filtres.ecoleId, scope: filtres.ecoleId ? 'ECOLE' : 'ORGANISATION' },
          contexte: { sourceAudit: 'CONSULTATION', modeOffline: false },
          createdAt: new Date(0).toISOString(),
          dateAction: new Date(0).toISOString(),
        },
      };
    }
    return AuditEntryPersistenceMapper.versDetailsReadModel(entree);
  }

  public async executerHistorique(filtres: SearchAuditQuery): Promise<AuditHistoryReadModel> {
    const resultat = await this.deps.searchRepository.rechercher(versFiltresRecherche(filtres), versPagination(filtres));
    return {
      items: resultat.resultats.map((entree) => AuditEntryPersistenceMapper.versAuditEntryOutput(entree)),
      total: resultat.total,
      correlationId: filtres.correlationId,
    };
  }

  public async executerConsultationSensible(filtres: SearchAuditQuery): Promise<SensitiveConsultationReadModel> {
    const resultat = this.deps.searchRepository.rechercherConsultationsSensibles
      ? await this.deps.searchRepository.rechercherConsultationsSensibles({ ...versFiltresRecherche(filtres), categorieAudit: 'CONSULTATION' }, versPagination(filtres))
      : await this.deps.searchRepository.rechercher({ ...versFiltresRecherche(filtres), categorieAudit: 'CONSULTATION' }, versPagination(filtres));
    const entree = premier(resultat.resultats);
    return {
      auditId: entree?.obtenirId() ?? 'AUDIT-ABSENT',
      consultationAutorisee: Boolean(entree),
      justification: entree ? undefined : 'Aucune consultation sensible trouvee pour ces filtres.',
      correlationId: filtres.correlationId,
    };
  }
}
