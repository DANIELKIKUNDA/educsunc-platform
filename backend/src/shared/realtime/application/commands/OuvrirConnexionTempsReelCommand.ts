export interface OuvrirConnexionTempsReelCommand {
  readonly connexionId: string;
  readonly utilisateurId: string;
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
}
