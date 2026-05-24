// Ce read-model optimise une lecture applicative du BC Audit.
export interface SecurityAlertReadModel {
  readonly code: string;
  readonly message: string;
  readonly gravite: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
