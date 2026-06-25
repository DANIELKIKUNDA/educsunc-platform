import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';

// Ce repository charge les manifests documentaires officiels depuis le repo.
export class BulletinTemplateManifestFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
  ) {}

  public async charger(template: BulletinTemplateDocumentaire): Promise<BulletinTemplateLayoutReadModel | null> {
    const cheminManifest = path.join(this.racineTemplates, template, 'layout.manifest.json');

    try {
      const contenu = await readFile(cheminManifest, 'utf8');
      return JSON.parse(contenu) as BulletinTemplateLayoutReadModel;
    } catch {
      return null;
    }
  }
}
