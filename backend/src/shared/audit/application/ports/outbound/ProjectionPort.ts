// Ce port applicatif formalise une frontiere du BC Audit.
export interface ProjectionPort { projeterAudit(payload: Record<string, unknown>): Promise<void>; }
