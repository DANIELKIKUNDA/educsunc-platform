import type {
  SearchAuditEntriesQuery,
} from '../../../../../application/queries/search';
import type { SearchAuditQuery } from '../../../../../application/dto/queries/SearchAuditQuery';
import type { AuditSearchReadModel } from '../../../../../application/read-models/search/AuditSearchReadModel';
import { versFiltresRecherche, versPagination, versSearchReadModel } from '../query-helpers';

export class PostgresSearchQueries implements
  SearchAuditEntriesQuery {
  public constructor(private readonly deps: Pick<import('../query-helpers').AuditQueryDependencies, 'searchRepository'>) {}

  public async executer(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    const resultat = await this.deps.searchRepository.rechercher(versFiltresRecherche(filtres), versPagination(filtres));
    return versSearchReadModel(resultat, versFiltresRecherche(filtres) as Record<string, unknown>);
  }

  public async executerParActeur(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    return this.executer({ ...filtres, acteurId: filtres.acteurId });
  }

  public async executerParCorrelation(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    return this.executer({ ...filtres, correlationId: filtres.correlationId });
  }

  public async executerParRessource(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    return this.executer({ ...filtres, ressourceId: filtres.ressourceId });
  }

  public async executerCritiques(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    const resultat = this.deps.searchRepository.rechercherCritiques
      ? await this.deps.searchRepository.rechercherCritiques({ ...versFiltresRecherche(filtres), graviteAudit: filtres.gravite ?? 'CRITIQUE' }, versPagination(filtres))
      : await this.deps.searchRepository.rechercher({ ...versFiltresRecherche(filtres), graviteAudit: filtres.gravite ?? 'CRITIQUE' }, versPagination(filtres));
    return versSearchReadModel(resultat, { ...versFiltresRecherche(filtres), graviteAudit: filtres.gravite ?? 'CRITIQUE' } as Record<string, unknown>);
  }

  public async executerConsultationsSensibles(filtres: SearchAuditQuery): Promise<AuditSearchReadModel> {
    const resultat = this.deps.searchRepository.rechercherConsultationsSensibles
      ? await this.deps.searchRepository.rechercherConsultationsSensibles({ ...versFiltresRecherche(filtres), categorieAudit: 'CONSULTATION' }, versPagination(filtres))
      : await this.deps.searchRepository.rechercher({ ...versFiltresRecherche(filtres), categorieAudit: 'CONSULTATION' }, versPagination(filtres));
    return versSearchReadModel(resultat, { ...versFiltresRecherche(filtres), categorieAudit: 'CONSULTATION' } as Record<string, unknown>);
  }
}
