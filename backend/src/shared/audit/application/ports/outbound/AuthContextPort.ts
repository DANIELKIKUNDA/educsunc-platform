// Ce port applicatif formalise une frontiere du BC Audit.
export interface AuthContextPort { obtenirContexteAuthentification(): Promise<Record<string, unknown>>; }
