export type StatutProgrammeNiveau = 'BROUILLON' | 'VALIDE' | 'ARCHIVE';

export interface ProgrammeNiveauResume {
  id: string;
  idClasseAcademique: string;
  idAnneeScolaire: string;
  statut: StatutProgrammeNiveau;
}
