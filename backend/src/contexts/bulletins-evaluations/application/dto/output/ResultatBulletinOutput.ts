import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { ApplicationConduiteOutput } from './ApplicationConduiteOutput';
import type { DiagnosticEchecOutput } from './DiagnosticEchecOutput';

// Ce DTO represente les resultats consolides d'un eleve.
export interface ResultatBulletinOutput {
  idResultatBulletinEleve: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idEcole: string;
  idClassePedagogique: string;
  resultatsColonnes: {
    codeColonne: CodeColonneBulletin;
    totalObtenu?: number;
    maximumGeneral?: number;
    pourcentage?: number;
    rang?: number;
    estClassable: boolean;
    estNonClasse: boolean;
  }[];
  applications: ApplicationConduiteOutput[];
  diagnostics: DiagnosticEchecOutput[];
}
