import type { ProclamationTemplateDocumentaire } from './ProclamationDocumentDataReadModel';

export type ProclamationTemplatePackageNiveauPreparation =
  | 'DECLARE'
  | 'MANIFESTS_OK'
  | 'PRET_POUR_CALIBRATION'
  | 'PRET_POUR_RENDERER_GRAPHIQUE';

export interface ProclamationTemplatePackageReadModel {
  template: ProclamationTemplateDocumentaire;
  dossierTemplate: string;
  layoutManifestPresent: boolean;
  backgroundManifestPresent: boolean;
  backgroundMasterPresent: boolean;
  zoneCalibrationPresent: boolean;
  statutBackground?: string;
  etatCalibration?: string;
  nombreZonesCalibration?: number;
  niveauPreparation: ProclamationTemplatePackageNiveauPreparation;
  anomalies: string[];
}
