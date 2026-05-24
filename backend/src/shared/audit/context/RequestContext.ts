export interface RequestContext {
  readonly requestId: string;
  readonly route?: string;
  readonly methode?: string;
  readonly headersUtiles: Record<string, string>;
  readonly timing: {
    readonly recuAt: string;
    readonly startedAt?: string;
  };
  readonly adresseIp?: string;
  readonly userAgent?: string;
}

