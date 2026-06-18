import type { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';

// Ce DTO porte les informations necessaires a l'encodage de la conduite.
export interface EncoderConduiteInput {
  idResultatBulletinEleve: string;
  codePeriode: CodePeriodeSimple;
  pointsConduite: number;
  idUtilisateur: string;
  idOrganisation?: string;
}
