export interface RealtimeSecurityProjection {
  readonly autorise: boolean;
  readonly scopes: readonly string[];
  readonly permissions: readonly string[];
}

export interface RealtimeSecurityEvenement {
  readonly type: 'SECURITY_POLICY_UPDATED';
  readonly autorise: boolean;
  readonly scopes: readonly string[];
  readonly permissions: readonly string[];
}
