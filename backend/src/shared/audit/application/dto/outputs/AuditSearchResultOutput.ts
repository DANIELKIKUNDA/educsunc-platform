import type { AuditEntryOutput } from './AuditEntryOutput';

// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditSearchResultOutput {
  readonly total: number;
  readonly page: number;
  readonly taillePage: number;
  readonly totalPages: number;
  readonly nextCursor?: string;
  readonly hasNextPage: boolean;
  readonly items: readonly AuditEntryOutput[];
  readonly pagination: {
    readonly page: number;
    readonly taille: number;
    readonly total: number;
    readonly totalPages: number;
    readonly nextCursor?: string;
    readonly hasNextPage: boolean;
  };
}
