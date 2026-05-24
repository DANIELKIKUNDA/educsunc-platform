// Ce read-model optimise une lecture applicative du BC Audit.
import type { AuditSearchItemReadModel } from './AuditSearchItemReadModel';
import type { AuditSearchPaginationReadModel } from './AuditSearchPaginationReadModel';
import type { AuditSearchFiltersReadModel } from './AuditSearchFiltersReadModel';

export interface AuditSearchReadModel { readonly total: number; readonly items: readonly AuditSearchItemReadModel[]; readonly pagination: AuditSearchPaginationReadModel; readonly filtres?: AuditSearchFiltersReadModel; }
