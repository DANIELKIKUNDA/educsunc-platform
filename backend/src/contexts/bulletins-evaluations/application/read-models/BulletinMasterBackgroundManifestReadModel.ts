import type { BulletinTemplateDocumentaire } from './BulletinDocumentDataReadModel';

export interface BulletinMasterBackgroundManifestReadModel {
  template: BulletinTemplateDocumentaire;
  backgroundId: string;
  version: string;
  sourcePdfRelativePath: string;
  statutPreparation: 'SOURCE_REFERENCE' | 'NEUTRALISATION_EN_ATTENTE' | 'NEUTRALISE_DISPONIBLE';
  commentaire: string;
}
