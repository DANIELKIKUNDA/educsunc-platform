// Ce port applicatif formalise une frontiere du BC Audit.
export interface DeviceContextPort { obtenirContexteAppareil(): Promise<Record<string, unknown>>; }
