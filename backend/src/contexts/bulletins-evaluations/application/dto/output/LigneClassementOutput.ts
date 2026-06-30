import type { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';

// Ce DTO represente une ligne de classement prete a l'affichage.
export interface LigneClassementOutput {
  idEleve: string;
  nomComplet: string;
  sexe: SexeEleve;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estNonClasse: boolean;
}
