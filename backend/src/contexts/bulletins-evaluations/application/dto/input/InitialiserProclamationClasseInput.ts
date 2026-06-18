import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les informations necessaires a l'initialisation d'une proclamation de classe.
export interface InitialiserProclamationClasseInput {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  idEcole: string;
  codeColonne: CodeColonneBulletin;
  versionReferentielProgramme: string;
  creePar: string;
}
