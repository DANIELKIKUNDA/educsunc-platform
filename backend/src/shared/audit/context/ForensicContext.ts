export interface ForensicContext {
  readonly chronology: {
    readonly dateReceptionServeur: string;
    readonly dateActionOriginale?: string;
  };
  readonly replayMetadata: Record<string, string | number | boolean>;
  readonly retryMetadata: Record<string, string | number | boolean>;
  readonly syncMetadata: Record<string, string | number | boolean>;
  readonly incidentMetadata: Record<string, string | number | boolean>;
  readonly investigationMetadata: Record<string, string | number | boolean>;
}

