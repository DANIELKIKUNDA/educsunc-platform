// Ce read model represente une entree d'historique de generation de bulletin.
export interface HistoriqueBulletinReadModel {
  dateGeneration: Date;
  generePar: string;
  motifGeneration?: string;
  versionBulletin: number;
  versionReferentielProgramme: string;
}
