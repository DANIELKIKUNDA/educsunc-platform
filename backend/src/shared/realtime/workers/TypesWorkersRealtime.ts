import type {
  AbonnerConnexionTempsReelCommand,
  OuvrirConnexionTempsReelCommand,
  PublierEvenementTempsReelCommand,
} from '../application';

export type TypeWorkerRealtime =
  | 'BROADCAST'
  | 'DISPATCH'
  | 'CONNECTIONS'
  | 'HEARTBEAT'
  | 'CONNECTIONS_CLEANUP'
  | 'SUBSCRIPTIONS'
  | 'SUBSCRIPTIONS_PROJECTION'
  | 'RECONNECTION'
  | 'REPLAY_LEGER'
  | 'RECOVERY'
  | 'STORM_PROTECTION'
  | 'OBSERVABILITY'
  | 'METRICS'
  | 'DIAGNOSTICS';

export type JobWorkerRealtime =
  | { readonly type: 'BROADCAST'; readonly payload: PublierEvenementTempsReelCommand }
  | { readonly type: 'DISPATCH'; readonly payload: PublierEvenementTempsReelCommand }
  | { readonly type: 'CONNECTIONS'; readonly payload: OuvrirConnexionTempsReelCommand }
  | { readonly type: 'HEARTBEAT'; readonly payload: { readonly connexionId?: string } }
  | { readonly type: 'CONNECTIONS_CLEANUP'; readonly payload: { readonly connexionIds: readonly string[] } }
  | { readonly type: 'SUBSCRIPTIONS'; readonly payload: AbonnerConnexionTempsReelCommand }
  | { readonly type: 'SUBSCRIPTIONS_PROJECTION'; readonly payload: { readonly abonnementId: string } }
  | { readonly type: 'RECONNECTION'; readonly payload: { readonly connexionId?: string } }
  | { readonly type: 'REPLAY_LEGER'; readonly payload: Record<string, never> }
  | { readonly type: 'RECOVERY'; readonly payload: Record<string, never> }
  | { readonly type: 'STORM_PROTECTION'; readonly payload: { readonly volume: number } }
  | { readonly type: 'OBSERVABILITY'; readonly payload: Record<string, never> }
  | { readonly type: 'METRICS'; readonly payload: Record<string, never> }
  | { readonly type: 'DIAGNOSTICS'; readonly payload: Record<string, never> };

export interface ResultatWorkerRealtime<TResult = unknown> {
  readonly worker: TypeWorkerRealtime;
  readonly succes: boolean;
  readonly resultat: TResult;
}
