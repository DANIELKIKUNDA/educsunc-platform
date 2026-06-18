export interface RealtimeSynchronisationProjection {
  readonly dernierEtat?: string;
  readonly totalSynchronisations: number;
}

export interface RealtimeSynchronisationEvenement {
  readonly type: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}
