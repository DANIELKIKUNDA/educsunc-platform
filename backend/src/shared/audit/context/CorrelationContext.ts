export interface CorrelationContext {
  readonly correlationId: string;
  readonly parentCorrelationId?: string;
  readonly workflowId?: string;
  readonly causationId?: string;
  readonly eventChain: readonly string[];
}

