import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';

export interface BulletinZoneCalibrationZoneReadModel {
  id: string;
  page: number;
  x: number | null;
  y: number | null;
  largeur: number | null;
  hauteur: number | null;
  alignement: 'left' | 'center' | 'right';
  statut: 'A_CALIBRER' | 'CALIBRE';
}

export interface BulletinZoneCalibrationTableReadModel {
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

export interface BulletinZoneCalibrationReadModel {
  template: BulletinTemplateDocumentaire;
  version: string;
  formatPage: 'A4-PORTRAIT';
  repere: {
    origine: 'TOP_LEFT';
    unite: 'PDF_POINTS';
  };
  etatCalibration: 'STRUCTURE_POSEE_A_AJUSTER' | 'PARTIELLEMENT_CALIBRE' | 'CALIBRE';
  zones: BulletinZoneCalibrationZoneReadModel[];
  tables: BulletinZoneCalibrationTableReadModel[];
}
