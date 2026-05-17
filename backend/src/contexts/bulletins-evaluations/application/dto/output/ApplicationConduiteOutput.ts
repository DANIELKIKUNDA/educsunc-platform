import type { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import type { MentionBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/MentionBulletin';

// Ce DTO represente l'affichage application et conduite pour une periode.
export interface ApplicationConduiteOutput {
  codePeriode: CodePeriodeSimple;
  application?: MentionBulletin;
  conduite?: MentionBulletin;
  pointsConduite?: number;
}
