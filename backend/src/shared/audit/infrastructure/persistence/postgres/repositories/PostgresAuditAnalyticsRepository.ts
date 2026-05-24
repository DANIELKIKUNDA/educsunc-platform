import type { AuditAnalyticsRepository, AuditAnalyticsSnapshot } from '../../../../domain/repositories';
import { appliquerFiltresAudit, construireAnalyticsSnapshot } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository s'appuie sur des pre-aggregations sobres plutot qu'un recalcul massif permanent.
export class PostgresAuditAnalyticsRepository implements AuditAnalyticsRepository {
  public async calculerStatistiques(filtres: Record<string, unknown>): Promise<Record<string, unknown>> {
    const entrees = this.filtrerEntrees(filtres);
    return construireAnalyticsSnapshot('stats-courantes', entrees).compteurs;
  }

  public async calculerVolumetrieTenant(params: { organisationId?: string; ecoleId?: string }): Promise<Record<string, unknown>> {
    const entrees = this.filtrerEntrees(params);
    return {
      totalAudits: entrees.length,
      totalOffline: entrees.filter((entree) => entree.obtenirContexteAudit().estOffline()).length,
    };
  }

  public async calculerActiviteUtilisateurs(filtres: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    const compteurs = new Map<string, number>();
    for (const entree of this.filtrerEntrees(filtres)) {
      const idUtilisateur = entree.obtenirActeurAudit().obtenirIdUtilisateur() ?? 'ANONYME';
      compteurs.set(idUtilisateur, (compteurs.get(idUtilisateur) ?? 0) + 1);
    }
    return [...compteurs.entries()].map(([idUtilisateur, total]) => ({ idUtilisateur, total }));
  }

  public async enregistrerSnapshot(snapshot: AuditAnalyticsSnapshot): Promise<void> {
    obtenirMemoireAuditStore().auditAnalyticsSnapshots.set(snapshot.cle, snapshot);
  }

  public async listerSnapshots(
    filtres: { organisationId?: string; ecoleId?: string; dateReference?: string },
  ): Promise<AuditAnalyticsSnapshot[]> {
    return [...obtenirMemoireAuditStore().auditAnalyticsSnapshots.values()].filter((snapshot) => {
      if (filtres.dateReference && snapshot.dateReference !== filtres.dateReference) { return false; }
      return true;
    });
  }

  private filtrerEntrees(filtres: Record<string, unknown>) {
    return [...obtenirMemoireAuditStore().auditEntries.values()].filter((entree) =>
      appliquerFiltresAudit(entree, filtres as Parameters<typeof appliquerFiltresAudit>[1]));
  }
}
