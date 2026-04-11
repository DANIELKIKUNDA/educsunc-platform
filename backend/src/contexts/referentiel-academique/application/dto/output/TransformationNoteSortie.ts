// Ce DTO represente la forme de sortie standard d'une transformation de note.
export interface TransformationNoteSortie {
  idNote: string;
  ancienneValeur: number;
  nouvelleValeur: number;
  ancienMaximum: number;
  nouveauMaximum: number;
  regleAppliquee: string;
  dateTransformation: string;
}
