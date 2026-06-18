import { ModeleNotification, PreferencesNotification } from '../../domain';
import { ProviderNotificationTechnique } from '../providers';

// Ce fichier declare les types techniques du bloc cache Notifications.

/** Cette interface represente une entree technique de cache avec expiration simple. */
export interface EntreeCacheNotification<T> {
  readonly cle: string;
  readonly valeur: T;
  readonly expireLe: Date;
}

/** Cette interface represente un quota technique mis en cache. */
export interface QuotaCacheNotification {
  readonly cle: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly canal?: string;
  readonly valeur: number;
  readonly expireLe: Date;
}

/** Cette interface represente un cache de templates par cle technique. */
export type IndexCacheTemplatesNotification = Map<string, EntreeCacheNotification<ModeleNotification>>;

/** Cette interface represente un cache de preferences par destinataire. */
export type IndexCachePreferencesNotification = Map<string, EntreeCacheNotification<PreferencesNotification>>;

/** Cette interface represente un cache de providers par canal. */
export type IndexCacheProvidersNotification = Map<string, EntreeCacheNotification<ProviderNotificationTechnique>>;
