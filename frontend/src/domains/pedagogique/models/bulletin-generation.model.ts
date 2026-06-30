export type BulletinGenerationActorCode = 'TITULAIRE';

export interface BulletinGenerationRequest {
  idEleve: string;
  idInscriptionScolaire: string;
  idAnneeScolaire: string;
  typeGeneration: 'BROUILLON' | 'PROGRESSIF' | 'FINALISATION';
  versionBulletin?: number;
  preparerPdf?: boolean;
}

export interface BulletinGenerationViewModel {
  idBulletinEleve: string;
  idEleve: string;
  idInscriptionScolaire: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  versionBulletin: number;
  etatBulletin: string;
  typeStructureEvaluation: string;
  lignesCount: number;
  blocsCount: number;
}

export const authorizedBulletinGenerationActors: BulletinGenerationActorCode[] = [
  'TITULAIRE',
];
