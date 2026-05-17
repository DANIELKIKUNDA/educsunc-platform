import type { CodeColonneBulletin } from '../../../bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { StyleAffichageCote } from '../../../bulletins-evaluations/domain/value-objects/StyleAffichageCote';

// Ce read model represente une ligne de bulletin optimisee pour la lecture.
export interface LigneBulletinReadModel {
  idReferentielCours: string;
  libelleCours: string;
  ordreAffichage: number;
  estCalculable: boolean;
  aExamen: boolean;
  cotesColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  totauxColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  stylesColonnes: Partial<Record<CodeColonneBulletin, StyleAffichageCote>>;
}
