import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO porte les informations necessaires pour declarer un eleve non classe.
export interface DeclarerNonClasseInput {
  idResultatBulletinEleve: string;
  codeColonne: CodeColonneBulletin;
  idUtilisateur?: string;
}
