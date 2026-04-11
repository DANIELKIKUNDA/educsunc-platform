// Ce DTO represente une demande de transformation de note a executer pendant une migration.
export interface DemandeTransformationNoteEntree {
  idNote: string;
  ancienneValeur: number;
  ancienMaximum: number;
  nouveauMaximum: number;
}
