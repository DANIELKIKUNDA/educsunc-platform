import type { ProclamationTemplateDocumentaire } from './ProclamationDocumentDataReadModel';

export interface ProclamationTemplatePageReadModel {
  numeroPage: number;
  formatPage: 'A4-PORTRAIT';
  backgroundId: string;
  role: 'PAGE_1_CLASSEMENT' | 'PAGE_2_CLASSEMENT_ET_NON_CLASSES';
}

export interface ProclamationTemplateLayoutReadModel {
  template: ProclamationTemplateDocumentaire;
  version: string;
  pages: ProclamationTemplatePageReadModel[];
}
