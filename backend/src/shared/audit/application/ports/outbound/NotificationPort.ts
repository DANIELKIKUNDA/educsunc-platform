// Ce port applicatif formalise une frontiere du BC Audit.
export interface NotificationPort { notifierSecurite?(payload: Record<string, unknown>): Promise<void>; notifierSupervision?(payload: Record<string, unknown>): Promise<void>; }
