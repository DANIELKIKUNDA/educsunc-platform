import type { AuditExportItemReadModel } from './AuditExportItemReadModel';

// Ce read-model optimise une lecture applicative du BC Audit.
export interface AuditExportReadModel {
  readonly exportId: string;
  readonly format: string;
  readonly nombreElements: number;
  readonly dateGeneration: string;
  readonly items: readonly AuditExportItemReadModel[];
  readonly urlTemporaire?: string;
}
