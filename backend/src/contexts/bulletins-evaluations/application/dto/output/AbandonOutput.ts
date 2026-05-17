import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';

// Ce DTO represente un eleve abandon expose a l'application.
export interface AbandonOutput {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve;
  dateAbandon?: Date;
  motifAbandon?: string;
}
