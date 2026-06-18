import { EffectiveConfigurationDto, ConfigurationSnapshotDto, ConfigurationValidationDto } from '../../application';

// Ce fichier declare les types techniques de cache.

/** Cette interface represente une entree de cache TTL. */
export interface EntreeCacheConfiguration<TValeur> {
  readonly cle: string;
  readonly valeur: TValeur;
  readonly expireLe: Date;
}

/** Cette interface represente un snapshot technique des caches de configuration. */
export interface SnapshotCacheConfiguration {
  readonly effectif: readonly EntreeCacheConfiguration<EffectiveConfigurationDto>[];
  readonly snapshots: readonly EntreeCacheConfiguration<ConfigurationSnapshotDto>[];
  readonly validations: readonly EntreeCacheConfiguration<ConfigurationValidationDto>[];
}
