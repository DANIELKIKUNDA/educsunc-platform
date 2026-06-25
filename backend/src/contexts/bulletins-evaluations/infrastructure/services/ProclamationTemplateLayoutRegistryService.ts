import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationTemplateLayoutReadModel';
import { ProclamationTemplateManifestFileRepository } from './ProclamationTemplateManifestFileRepository';

// Ce service resout le layout documentaire concret d'une proclamation.
export class ProclamationTemplateLayoutRegistryService {
  constructor(
    private readonly manifestRepository = new ProclamationTemplateManifestFileRepository(),
  ) {}

  public async resoudre(template: ProclamationTemplateDocumentaire): Promise<ProclamationTemplateLayoutReadModel> {
    return await this.manifestRepository.charger(template) ?? {
      template,
      version: '1.0.0',
      pages: [
        { numeroPage: 1, formatPage: 'A4-PORTRAIT', backgroundId: 'procl-page-1', role: 'PAGE_1_CLASSEMENT' },
        { numeroPage: 2, formatPage: 'A4-PORTRAIT', backgroundId: 'procl-page-2', role: 'PAGE_2_CLASSEMENT_ET_NON_CLASSES' },
      ],
    };
  }
}
