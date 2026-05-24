// Ce port applicatif formalise une frontiere du BC Audit.
export interface CorrelationContextPort { obtenirCorrelationId(): Promise<string | undefined>; obtenirRequestId(): Promise<string | undefined>; }
