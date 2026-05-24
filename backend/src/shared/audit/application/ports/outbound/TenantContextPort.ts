// Ce port applicatif formalise une frontiere du BC Audit.
export interface TenantContextPort { obtenirContexteTenant(): Promise<Record<string, unknown>>; }
