import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationMasterBackgroundManifestReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationMasterBackgroundManifestReadModel';

// Ce repository lit le manifeste de fond maitre des proclamations.
export class ProclamationMasterBackgroundManifestFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
  ) {}

  public async charger(
    template: ProclamationTemplateDocumentaire,
  ): Promise<ProclamationMasterBackgroundManifestReadModel | null> {
    const cheminManifest = path.join(this.racineTemplates, template, 'background.manifest.json');

    try {
      const contenu = await readFile(cheminManifest, 'utf8');
      return JSON.parse(contenu) as ProclamationMasterBackgroundManifestReadModel;
    } catch {
      return null;
    }
  }
}
