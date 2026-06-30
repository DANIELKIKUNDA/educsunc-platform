export type ProclamationGenerationActorCode = 'TITULAIRE';

export interface ProclamationGenerationRequest {
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: string;
  typeProclamation: 'PERIODE' | 'EXAMEN' | 'SEMESTRE' | 'TRIMESTRE' | 'ANNUEL';
}

export interface ProclamationGenerationViewModel {
  idProclamationClasse: string;
  idClassePedagogique: string;
  idAnneeScolaire: string;
  codeColonne: string;
  typeProclamation: string;
  lignesCount: number;
  nonClassesCount: number;
  abandonsCount: number;
  classesCount: number;
}

export const authorizedProclamationGenerationActors: ProclamationGenerationActorCode[] = [
  'TITULAIRE',
];
