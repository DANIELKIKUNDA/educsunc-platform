// Ce fichier definit la sortie applicative d'eligibilite famille nombreuse.
export interface FamilleNombreuseSortieDTO {
  idFamille: string;
  nombreElevesEligibles: number;
  seuilFamilleNombreuse: number;
  eligible: boolean;
}
