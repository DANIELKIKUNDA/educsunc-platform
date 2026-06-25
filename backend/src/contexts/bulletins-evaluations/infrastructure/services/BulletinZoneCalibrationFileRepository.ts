import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinZoneCalibrationReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinZoneCalibrationReadModel';

// Ce repository charge la calibration officielle des zones d'un template bulletin.
export class BulletinZoneCalibrationFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
  ) {}

  public async charger(
    template: BulletinTemplateDocumentaire,
  ): Promise<BulletinZoneCalibrationReadModel | null> {
    const cheminCalibration = path.join(this.racineTemplates, template, 'zones.calibration.json');

    try {
      const contenu = await readFile(cheminCalibration, 'utf8');
      return JSON.parse(contenu) as BulletinZoneCalibrationReadModel;
    } catch {
      return null;
    }
  }
}
