import type { ConfigurationContext } from '../../context';

// Ce fichier declare les types du pont Runtime.

export interface ConfigurationRuntimeSignal {
  readonly type: 'RELOAD' | 'CACHE_INVALIDATION' | 'PROPAGATION_DONE';
  readonly contexte: ConfigurationContext;
  readonly force: boolean;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationRuntimeSnapshot {
  readonly totalSignals: number;
  readonly derniersSignals: readonly ConfigurationRuntimeSignal[];
}
