import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';

export type BulletinTemplateBackgroundFormat = 'PDF' | 'PNG';
export type BulletinTemplateZoneAlignement = 'left' | 'center' | 'right';
export type BulletinTemplateZoneMode =
  | 'text'
  | 'multiline-text'
  | 'table'
  | 'image'
  | 'checkbox-or-marker'
  | 'text-or-image'
  | 'image-or-text';
export type BulletinTemplateZoneOverflow =
  | 'truncate'
  | 'reduce-font'
  | 'multiline'
  | 'interdire'
  | 'n/a';
export type BulletinTemplateZoneCriticite = 'critique' | 'forte' | 'standard';

export interface BulletinTemplateBackgroundReadModel {
  id: string;
  format: BulletinTemplateBackgroundFormat;
  description: string;
  neutralise: boolean;
}

export interface BulletinTemplatePageReadModel {
  numeroPage: number;
  formatPage: 'A4-PORTRAIT';
  background: BulletinTemplateBackgroundReadModel;
}

export interface BulletinTemplateZoneReadModel {
  id: string;
  page: number;
  famille: string;
  ancrage: string;
  alignement: BulletinTemplateZoneAlignement;
  mode: BulletinTemplateZoneMode;
  source?: string;
  politiqueOverflow: BulletinTemplateZoneOverflow;
  criticite: BulletinTemplateZoneCriticite;
}

export interface BulletinTemplateTableLayoutReadModel {
  id: string;
  page: number;
  source: string;
  colonnes: string[];
  hauteurLigne: 'FIXE';
}

export interface BulletinTemplateLayoutReadModel {
  template: BulletinTemplateDocumentaire;
  version: string;
  pages: BulletinTemplatePageReadModel[];
  zones: BulletinTemplateZoneReadModel[];
  tables: BulletinTemplateTableLayoutReadModel[];
}
