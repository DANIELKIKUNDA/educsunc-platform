import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';

export type BulletinTemplatePackageNiveauPreparation =
  | 'DECLARE'
  | 'MANIFESTS_OK'
  | 'PRET_POUR_CALIBRATION'
  | 'PRET_POUR_RENDERER_GRAPHIQUE';

export interface BulletinTemplatePackageReadModel {
  template: BulletinTemplateDocumentaire;
  dossierTemplate: string;
  layoutManifestPresent: boolean;
  backgroundManifestPresent: boolean;
  backgroundMasterPresent: boolean;
  zoneCalibrationPresent: boolean;
  statutBackground?: string;
  etatCalibration?: string;
  nombreZonesCalibration?: number;
  niveauPreparation: BulletinTemplatePackageNiveauPreparation;
  anomalies: string[];
}
