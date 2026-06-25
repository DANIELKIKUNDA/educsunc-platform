import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BulletinMasterBackgroundManifestReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinMasterBackgroundManifestReadModel';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';

// Ce repository lit les manifests de fond maitre versionnes pour chaque template.
export class BulletinMasterBackgroundManifestFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
  ) {}

  public async charger(
    template: BulletinTemplateDocumentaire,
  ): Promise<BulletinMasterBackgroundManifestReadModel | null> {
    const cheminManifest = path.join(this.racineTemplates, template, 'background.manifest.json');

    try {
      const contenu = await readFile(cheminManifest, 'utf8');
      return JSON.parse(contenu) as BulletinMasterBackgroundManifestReadModel;
    } catch {
      return null;
    }
  }
}
