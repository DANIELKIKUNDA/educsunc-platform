import { StatutProgrammeNiveau } from '../../../domain/value-objects/StatutProgrammeNiveau';
import { LigneProgrammeNiveauSortie } from './LigneProgrammeNiveauSortie';

// Ce DTO represente la forme de sortie standard d'un programme niveau cote application.
export interface ProgrammeNiveauSortie {
  id: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  statut: StatutProgrammeNiveau;
  creeLe: string;
  version: number;
  lignes: LigneProgrammeNiveauSortie[];
  creePar?: string;
  valideLe?: string;
  validePar?: string;
  archiveLe?: string;
}
