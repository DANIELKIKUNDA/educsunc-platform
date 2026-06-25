import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationTemplateLayoutReadModel';

// Ce repository charge les manifests documentaires officiels des proclamations.
export class ProclamationTemplateManifestFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
  ) {}

  public async charger(template: ProclamationTemplateDocumentaire): Promise<ProclamationTemplateLayoutReadModel | null> {
    const cheminManifest = path.join(this.racineTemplates, template, 'layout.manifest.json');

    try {
      const contenu = await readFile(cheminManifest, 'utf8');
      return JSON.parse(contenu) as ProclamationTemplateLayoutReadModel;
    } catch {
      return null;
    }
  }
}
