// Ce read-model optimise une lecture applicative du BC Audit.
export interface CrossTenantAlertReadModel { readonly organisationId?: string; readonly ecoleId?: string; readonly message: string; }
