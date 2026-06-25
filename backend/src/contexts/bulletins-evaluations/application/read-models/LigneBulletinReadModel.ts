import type { CodeColonneBulletin } from '../../../bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { StyleAffichageCote } from '../../../bulletins-evaluations/domain/value-objects/StyleAffichageCote';

// Ce read model represente une ligne de bulletin optimisee pour la lecture.
export interface LigneBulletinReadModel {
  idReferentielCours: string;
  libelleCours: string;
  libelleAffichage?: string;
  ordreAffichage: number;
  estCalculable: boolean;
  aExamen: boolean;
  mentionRepechage?: string;
  typeLigneDocumentaire?: 'COURS' | 'DOMAINE' | 'SOUS_DOMAINE' | 'SOUS_TOTAL' | 'TOTAL_DOMAINE';
  domaine?: string;
  sousDomaine?: string;
  cotesColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  totauxColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  maximaColonnes: Partial<Record<CodeColonneBulletin, number | null>>;
  stylesColonnes: Partial<Record<CodeColonneBulletin, StyleAffichageCote>>;
}
