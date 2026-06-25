import { access } from 'node:fs/promises';
import path from 'node:path';
import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type {
  ProclamationTemplatePackageNiveauPreparation,
  ProclamationTemplatePackageReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/ProclamationTemplatePackageReadModel';
import { ProclamationMasterBackgroundManifestFileRepository } from './ProclamationMasterBackgroundManifestFileRepository';
import { ProclamationZoneCalibrationFileRepository } from './ProclamationZoneCalibrationFileRepository';

async function existeFichier(chemin: string): Promise<boolean> {
  try {
    await access(chemin);
    return true;
  } catch {
    return false;
  }
}

// Ce service inspecte le package documentaire reel d'un template de proclamation.
export class ProclamationTemplatePackageInspectorService {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
    private readonly backgroundManifestRepository = new ProclamationMasterBackgroundManifestFileRepository(
      path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
    ),
    private readonly zoneCalibrationRepository = new ProclamationZoneCalibrationFileRepository(
      path.resolve(process.cwd(), '..', 'docs', 'assets', 'proclamations_templates'),
    ),
  ) {}

  public async inspecter(template: ProclamationTemplateDocumentaire): Promise<ProclamationTemplatePackageReadModel> {
    const dossierTemplate = path.join(this.racineTemplates, template);
    const layoutManifest = path.join(dossierTemplate, 'layout.manifest.json');
    const backgroundManifestPath = path.join(dossierTemplate, 'background.manifest.json');
    const backgroundMasterPdf = path.join(dossierTemplate, 'background.master.pdf');
    const zoneCalibration = path.join(dossierTemplate, 'zones.calibration.json');

    const [
      layoutManifestPresent,
      backgroundManifestPresent,
      backgroundMasterPresent,
      zoneCalibrationPresent,
    ] = await Promise.all([
      existeFichier(layoutManifest),
      existeFichier(backgroundManifestPath),
      existeFichier(backgroundMasterPdf),
      existeFichier(zoneCalibration),
    ]);

    const anomalies: string[] = [];
    const backgroundManifest = backgroundManifestPresent
      ? await this.backgroundManifestRepository.charger(template)
      : null;
    const calibration = zoneCalibrationPresent
      ? await this.zoneCalibrationRepository.charger(template)
      : null;

    if (!layoutManifestPresent) {
      anomalies.push('layout.manifest.json absent');
    }

    if (!backgroundManifestPresent) {
      anomalies.push('background.manifest.json absent');
    }

    if (!backgroundMasterPresent) {
      anomalies.push('background.master.pdf absent');
    }

    if (!zoneCalibrationPresent) {
      anomalies.push('zones.calibration.json absent');
    }

    return {
      template,
      dossierTemplate,
      layoutManifestPresent,
      backgroundManifestPresent,
      backgroundMasterPresent,
      zoneCalibrationPresent,
      statutBackground: backgroundManifest?.statutPreparation,
      etatCalibration: calibration?.etatCalibration,
      nombreZonesCalibration: calibration?.zones.length,
      niveauPreparation: this.determinerNiveauPreparation({
        layoutManifestPresent,
        backgroundManifestPresent,
        backgroundMasterPresent,
        zoneCalibrationPresent,
      }),
      anomalies,
    };
  }

  private determinerNiveauPreparation(entree: {
    layoutManifestPresent: boolean;
    backgroundManifestPresent: boolean;
    backgroundMasterPresent: boolean;
    zoneCalibrationPresent: boolean;
  }): ProclamationTemplatePackageNiveauPreparation {
    if (!entree.layoutManifestPresent && !entree.backgroundManifestPresent) {
      return 'DECLARE';
    }

    if (
      entree.layoutManifestPresent
      && entree.backgroundManifestPresent
      && (!entree.backgroundMasterPresent || !entree.zoneCalibrationPresent)
    ) {
      return 'MANIFESTS_OK';
    }

    if (
      entree.layoutManifestPresent
      && entree.backgroundManifestPresent
      && entree.backgroundMasterPresent
      && !entree.zoneCalibrationPresent
    ) {
      return 'PRET_POUR_CALIBRATION';
    }

    if (
      entree.layoutManifestPresent
      && entree.backgroundManifestPresent
      && entree.backgroundMasterPresent
      && entree.zoneCalibrationPresent
    ) {
      return 'PRET_POUR_RENDERER_GRAPHIQUE';
    }

    return 'DECLARE';
  }
}
