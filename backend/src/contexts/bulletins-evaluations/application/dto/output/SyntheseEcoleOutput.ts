import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import type { LigneSyntheseOutput } from './LigneSyntheseOutput';
import type { StatistiquesProclamationOutput } from './StatistiquesProclamationOutput';

// Ce DTO represente une synthese complete des resultats d'une ecole.
export interface SyntheseEcoleOutput {
  idSyntheseResultatsEcole: string;
  idEcole: string;
  idAnneeScolaire: string;
  codeColonne: CodeColonneBulletin;
  typeSynthese: TypeSyntheseResultats;
  lignes: LigneSyntheseOutput[];
  totauxEcole?: StatistiquesProclamationOutput;
}
