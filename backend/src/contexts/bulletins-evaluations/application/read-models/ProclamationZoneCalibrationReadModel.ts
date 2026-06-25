import type { ProclamationTemplateDocumentaire } from './ProclamationDocumentDataReadModel';

export interface ProclamationZoneCalibrationZoneReadModel {
  id: string;
  page: number;
  x: number | null;
  y: number | null;
  largeur: number | null;
  hauteur: number | null;
  alignement: 'left' | 'center' | 'right';
  statut: 'A_CALIBRER' | 'CALIBRE';
}

export interface ProclamationZoneCalibrationTableReadModel {
  id: string;
  page: number;
  x: number | null;
  y: number | null;
  largeur: number | null;
  hauteur: number | null;
  hauteurLigne: number | null;
  colonnes: string[];
  statut: 'A_CALIBRER' | 'CALIBRE';
}

export interface ProclamationZoneCalibrationReadModel {
  template: ProclamationTemplateDocumentaire;
  version: string;
  formatPage: 'A4-PORTRAIT';
  repere: {
    origine: 'BOTTOM_LEFT';
    unite: 'PDF_POINTS';
  };
  etatCalibration: 'STRUCTURE_POSEE_A_AJUSTER' | 'PARTIELLEMENT_CALIBRE' | 'CALIBRE';
  zones: ProclamationZoneCalibrationZoneReadModel[];
  tables: ProclamationZoneCalibrationTableReadModel[];
}
