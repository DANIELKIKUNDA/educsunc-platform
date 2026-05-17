import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { StyleAffichageCote } from 'contexts/bulletins-evaluations/domain/value-objects/StyleAffichageCote';

// Ce DTO represente une colonne de cote telle qu'elle doit etre exposee a l'UI.
export interface LigneFicheCotationOutput {
  codeColonne: CodeColonneBulletin;
  coteObtenue: number | null;
  maximumColonne: number;
  estEchec: boolean;
  styleAffichage?: StyleAffichageCote;
}
