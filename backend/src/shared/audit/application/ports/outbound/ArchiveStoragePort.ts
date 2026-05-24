// Ce port applicatif formalise une frontiere du BC Audit.
export interface ArchiveStoragePort { archiver(payload: Record<string, unknown>): Promise<string>; }
