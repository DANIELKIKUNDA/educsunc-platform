import type { CodeColonneBulletin } from '../../../bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { LigneClassementReadModel } from './LigneClassementReadModel';

// Ce read model represente un classement complet optimise pour l'UI.
export interface ClassementClasseReadModel {
  idClassementColonneClasse: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  lignes: LigneClassementReadModel[];
}
