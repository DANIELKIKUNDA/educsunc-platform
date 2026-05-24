export interface AuditHttpSuccessBody<TData> {
  readonly success: true;
  readonly data: TData;
}

export interface AuditHttpErrorBody {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}
