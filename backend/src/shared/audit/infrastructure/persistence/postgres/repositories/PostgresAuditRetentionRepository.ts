import type { AuditRetentionRepository } from '../../../../domain/repositories';
import { appliquerFiltresAudit } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository prepare les decisions de retention et d'archivage a partir de la volumetrie.
export class PostgresAuditRetentionRepository implements AuditRetentionRepository {
  public async listerExpirables(reference: Date): Promise<string[]> {
    return this.listerAvant(reference, 30);
  }

  public async listerArchivables(reference: Date): Promise<string[]> {
    return this.listerAvant(reference, 90);
  }

  public async listerPurgeables(reference: Date): Promise<string[]> {
    return this.listerAvant(reference, 365);
  }

  public async lirePolitiquesRetention(): Promise<Record<string, unknown>[]> {
    return [
      { categorieAudit: 'SECURITE', dureeJours: 3650 },
      { categorieAudit: 'FINANCIER', dureeJours: 3650 },
      { categorieAudit: 'SYNC', dureeJours: 365 },
      { categorieAudit: 'EXPORT', dureeJours: 180 },
    ];
  }

  public async calculerDureeVie(params: { categorieAudit?: string; graviteAudit?: string }): Promise<number | null> {
    if (params.graviteAudit === 'CRITIQUE') {
      return 3650;
    }
    const politique = (await this.lirePolitiquesRetention()).find((ligne) => ligne.categorieAudit === params.categorieAudit);
    return typeof politique?.dureeJours === 'number' ? politique.dureeJours : null;
  }

  private async listerAvant(reference: Date, ageJours: number): Promise<string[]> {
    const seuil = new Date(reference.getTime() - ageJours * 24 * 60 * 60 * 1000);
    return [...obtenirMemoireAuditStore().auditEntries.values()]
      .filter((entree) =>
        appliquerFiltresAudit(entree, { dateFin: seuil }))
      .map((entree) => entree.obtenirId());
  }
}
