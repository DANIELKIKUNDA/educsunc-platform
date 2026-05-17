import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { StyleAffichageCote } from 'contexts/bulletins-evaluations/domain/value-objects/StyleAffichageCote';

// Ce DTO represente une ligne de bulletin prete a l'affichage.
export interface LigneBulletinOutput {
  idReferentielCours: string;
  libelleCours: string;
  ordreAffichage: number;
  estCalculable: boolean;
  aExamen: boolean;
  cotesColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  totauxColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  stylesColonnes: Partial<Record<CodeColonneBulletin, StyleAffichageCote>>;
}
