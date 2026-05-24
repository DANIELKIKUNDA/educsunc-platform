import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditEntryRepository, AuditSearchFilters } from '../../../../domain/repositories';
import { appliquerFiltresAudit } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository append-only reste la porte d'entree principale des ecritures Audit.
export class PostgresAuditEntryRepository implements AuditEntryRepository {
  public async ajouterAudit(entree: AuditEntry): Promise<void> {
    const store = obtenirMemoireAuditStore();
    const idAudit = entree.obtenirId();
    if (store.auditEntries.has(idAudit)) {
      return;
    }

    store.auditEntries.set(idAudit, entree);
    store.auditEntryOrder.push(idAudit);

    const correlationId = entree.obtenirAuditCorrelation()?.obtenirCorrelationId()?.obtenirValeur()
      ?? entree.obtenirContexteAudit().obtenirCorrelationId()?.obtenirValeur();
    if (correlationId) {
      const ids = store.auditEntryIdsByCorrelation.get(correlationId) ?? [];
      ids.push(idAudit);
      store.auditEntryIdsByCorrelation.set(correlationId, ids);
    }

    const requestId = entree.obtenirContexteAudit().obtenirRequestId()?.obtenirValeur();
    if (requestId) {
      const ids = store.auditEntryIdsByRequest.get(requestId) ?? [];
      ids.push(idAudit);
      store.auditEntryIdsByRequest.set(requestId, ids);
    }
  }

  public async trouverParId(idAudit: string): Promise<AuditEntry | null> {
    return obtenirMemoireAuditStore().auditEntries.get(idAudit) ?? null;
  }

  public async trouverParCorrelationId(correlationId: string): Promise<AuditEntry[]> {
    const store = obtenirMemoireAuditStore();
    return (store.auditEntryIdsByCorrelation.get(correlationId) ?? [])
      .map((idAudit) => store.auditEntries.get(idAudit))
      .filter((entree): entree is AuditEntry => entree instanceof Object);
  }

  public async trouverParRequestId(requestId: string): Promise<AuditEntry[]> {
    const store = obtenirMemoireAuditStore();
    return (store.auditEntryIdsByRequest.get(requestId) ?? [])
      .map((idAudit) => store.auditEntries.get(idAudit))
      .filter((entree): entree is AuditEntry => entree instanceof Object);
  }

  public async trouverParTenant(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]> {
    return this.listerSelonFiltres(params);
  }

  public async listerSelonFiltres(filtres: AuditSearchFilters): Promise<AuditEntry[]> {
    return [...obtenirMemoireAuditStore().auditEntries.values()].filter((entree) => appliquerFiltresAudit(entree, filtres));
  }

  public async existe(idAudit: string): Promise<boolean> {
    return obtenirMemoireAuditStore().auditEntries.has(idAudit);
  }

  public async ajouter(entree: AuditEntry): Promise<void> {
    return this.ajouterAudit(entree);
  }

  public async rechercherParId(idAudit: string): Promise<AuditEntry | null> {
    return this.trouverParId(idAudit);
  }

  public async rechercherParCorrelationId(correlationId: string): Promise<AuditEntry[]> {
    return this.trouverParCorrelationId(correlationId);
  }

  public async rechercherParTenant(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]> {
    return this.trouverParTenant(params);
  }
}
