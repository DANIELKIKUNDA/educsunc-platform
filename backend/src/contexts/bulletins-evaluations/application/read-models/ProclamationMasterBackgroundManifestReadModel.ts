import type { ProclamationTemplateDocumentaire } from './ProclamationDocumentDataReadModel';

export interface ProclamationMasterBackgroundManifestReadModel {
  template: ProclamationTemplateDocumentaire;
  backgroundId: string;
  version: string;
  sourcePdfRelativePath: string;
  statutPreparation: 'SOURCE_REFERENCE' | 'NEUTRALISATION_EN_ATTENTE' | 'NEUTRALISE_DISPONIBLE';
  commentaire: string;
}
