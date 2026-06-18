import type { PrioriteRealtime, TypeDiffusionRealtime } from '../../domain';

export interface PublierEvenementTempsReelCommand {
  readonly evenementId: string;
  readonly type: string;
  readonly visible: boolean;
  readonly impacteInterface: boolean;
  readonly necessiteReaction: boolean;
  readonly priorite: PrioriteRealtime;
  readonly typeDiffusion: TypeDiffusionRealtime;
  readonly raisonValeurUtilisateur: string;
  readonly utileImmediatement: boolean;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurIds: readonly string[];
  readonly permissionsRequises: readonly string[];
  readonly canal: string;
  readonly contexte: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly utilisateurId?: string;
    readonly module?: string;
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly traceId?: string;
    readonly sessionId?: string;
    readonly permissions: readonly string[];
    readonly emittedAt: string;
  };
  readonly payload: Readonly<Record<string, unknown>>;
}
