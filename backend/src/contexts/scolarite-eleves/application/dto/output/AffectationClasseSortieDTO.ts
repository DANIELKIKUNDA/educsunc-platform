// Ce fichier definit la sortie applicative d'une affectation de classe.
export interface AffectationClasseSortieDTO {
  idAffectationClasse: string;
  idOrganisation: string;
  idEcole: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  dateAffectation: string;
  motifAffectation?: string;
  active: boolean;
  version: number;
}
