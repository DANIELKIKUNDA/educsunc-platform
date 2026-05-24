// Ce read-model optimise une lecture applicative du BC Audit.
export interface ForensicSecurityReadModel { readonly acteurId?: string; readonly adresseIp?: string; readonly anomalies: readonly string[]; }
