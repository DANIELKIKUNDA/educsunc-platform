export interface RealtimeAuthProjection {
  readonly sessionActive: boolean;
  readonly utilisateurId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly permissions: readonly string[];
}

export interface RealtimeAuthEvenement {
  readonly type: 'AUTH_CONTEXT_UPDATED';
  readonly utilisateurId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly permissions: readonly string[];
  readonly sessionActive: boolean;
}
