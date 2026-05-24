export interface RetryContext {
  readonly retryCount: number;
  readonly retryReason?: string;
  readonly retryHistory: readonly string[];
  readonly retryBackoff?: number;
  readonly retryWindow?: string;
}

