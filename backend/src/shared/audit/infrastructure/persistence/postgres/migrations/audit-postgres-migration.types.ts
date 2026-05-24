// Ce type unifie les migrations documentaires du module Audit.
export interface AuditPostgresMigration {
  readonly nom: string;
  readonly ordre: number;
  readonly sql: string;
  readonly description: string;
}
