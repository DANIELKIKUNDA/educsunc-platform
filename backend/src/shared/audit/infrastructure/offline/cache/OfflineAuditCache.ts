import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditCacheEntry } from '../OfflineAuditTypes';

// Le cache offline sert la lecture locale mais ne remplace jamais la verite append-only serveur.
export class OfflineAuditCache {
  public ecrire(cleCache: string, valeur: Record<string, unknown>, expireLe?: Date): OfflineAuditCacheEntry {
    const entry: OfflineAuditCacheEntry = {
      cleCache,
      valeur,
      creeLe: new Date().toISOString(),
      expireLe: expireLe?.toISOString(),
    };
    obtenirOfflineAuditLocalStore().cache.set(cleCache, entry);
    return entry;
  }

  public lire(cleCache: string): OfflineAuditCacheEntry | null {
    return obtenirOfflineAuditLocalStore().cache.get(cleCache) ?? null;
  }
}
