// Ce read-model optimise une lecture applicative du BC Audit.
export interface SensitiveConsultationReadModel {
  readonly auditId: string;
  readonly consultationAutorisee: boolean;
  readonly justification?: string;
  readonly correlationId?: string;
}
