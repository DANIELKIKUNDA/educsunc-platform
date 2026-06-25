import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationZoneCalibrationReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationZoneCalibrationReadModel';

// Ce repository charge la calibration officielle des zones de proclamation.
export class ProclamationZoneCalibrationFileRepository {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
  ) {}

  public async charger(
    template: ProclamationTemplateDocumentaire,
  ): Promise<ProclamationZoneCalibrationReadModel | null> {
    const cheminCalibration = path.join(this.racineTemplates, template, 'zones.calibration.json');

    try {
      const contenu = await readFile(cheminCalibration, 'utf8');
      return JSON.parse(contenu) as ProclamationZoneCalibrationReadModel;
    } catch {
      return null;
    }
  }
}
