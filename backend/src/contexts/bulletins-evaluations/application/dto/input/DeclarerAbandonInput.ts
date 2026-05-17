// Ce DTO porte les informations necessaires pour signaler un abandon eleve.
export interface DeclarerAbandonInput {
  idEleve: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  dateAbandon?: Date;
  motifAbandon?: string;
  idUtilisateur: string;
}
