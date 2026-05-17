import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce DTO represente le diagnostic pedagogique expose a l'application.
export interface DiagnosticEchecOutput {
  codeColonne: CodeColonneBulletin;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique?: string;
}
