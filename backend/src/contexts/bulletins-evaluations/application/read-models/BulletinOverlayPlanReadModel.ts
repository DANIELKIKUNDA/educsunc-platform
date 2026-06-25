import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';

export interface BulletinOverlayElementReadModel {
  zoneId: string;
  page: number;
  mode: string;
  valeur: string;
}

export interface BulletinOverlayTablePlanReadModel {
  tableId: string;
  page: number;
  nombreLignes: number;
  colonnes: string[];
}

export interface BulletinOverlayPlanReadModel {
  template: BulletinTemplateDocumentaire;
  backgroundId: string;
  versionLayout: string;
  elements: BulletinOverlayElementReadModel[];
  tables: BulletinOverlayTablePlanReadModel[];
}
