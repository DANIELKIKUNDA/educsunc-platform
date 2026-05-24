// Ce port applicatif formalise une frontiere du BC Audit.
export interface ExportStoragePort { sauvegarderExport(payload: Record<string, unknown>): Promise<string>; }
