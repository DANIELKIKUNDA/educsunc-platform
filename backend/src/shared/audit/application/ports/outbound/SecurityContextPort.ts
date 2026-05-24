// Ce port applicatif formalise une frontiere du BC Audit.
export interface SecurityContextPort { obtenirContexteSecurite(): Promise<Record<string, unknown>>; }
