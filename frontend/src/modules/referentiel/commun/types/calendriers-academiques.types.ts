export type StatutCalendrierAcademique = 'BROUILLON' | 'VALIDE' | 'VERROUILLE';

export interface CalendrierAcademiqueResume {
  id: string;
  idAnneeScolaire: string;
  statut: StatutCalendrierAcademique;
}
