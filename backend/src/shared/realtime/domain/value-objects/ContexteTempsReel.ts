export interface ContexteTempsReelProps {
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
}

export class ContexteTempsReel {
  public readonly organisationId?: string;
  public readonly ecoleId?: string;
  public readonly utilisateurId?: string;
  public readonly module?: string;
  public readonly requestId?: string;
  public readonly correlationId?: string;
  public readonly traceId?: string;
  public readonly sessionId?: string;
  public readonly permissions: readonly string[];
  public readonly emittedAt: string;

  public constructor(props: ContexteTempsReelProps) {
    if (props.permissions.length === 0) {
      throw new Error('ContexteTempsReel sans permissions');
    }
    this.organisationId = props.organisationId;
    this.ecoleId = props.ecoleId;
    this.utilisateurId = props.utilisateurId;
    this.module = props.module;
    this.requestId = props.requestId;
    this.correlationId = props.correlationId;
    this.traceId = props.traceId;
    this.sessionId = props.sessionId;
    this.permissions = [...props.permissions];
    this.emittedAt = props.emittedAt;
  }
}
