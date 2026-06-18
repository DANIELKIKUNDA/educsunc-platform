import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';

// Ce read model represente un point d'observation de l'evolution d'un resultat.
export interface EvolutionResultatReadModel {
  codeColonne: CodeColonneBulletin;
  totalObtenu?: number;
  maximumGeneral?: number;
  pourcentage?: number;
  rang?: number;
  estNonClasse: boolean;
  dateObservation: Date;
  motifObservation: string;
  estEtatCourant: boolean;
}
