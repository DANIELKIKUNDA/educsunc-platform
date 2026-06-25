import { access } from 'node:fs/promises';
import path from 'node:path';
import type { BulletinTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type {
  BulletinTemplatePackageNiveauPreparation,
  BulletinTemplatePackageReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplatePackageReadModel';
import { BulletinMasterBackgroundManifestFileRepository } from './BulletinMasterBackgroundManifestFileRepository';
import { BulletinZoneCalibrationFileRepository } from './BulletinZoneCalibrationFileRepository';

async function existeFichier(chemin: string): Promise<boolean> {
  try {
    await access(chemin);
    return true;
  } catch {
    return false;
  }
}

// Ce service inspecte le package documentaire reel d'un template bulletin dans le repo.
export class BulletinTemplatePackageInspectorService {
  constructor(
    private readonly racineTemplates = path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
    private readonly backgroundManifestRepository = new BulletinMasterBackgroundManifestFileRepository(
      path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
    ),
    private readonly zoneCalibrationRepository = new BulletinZoneCalibrationFileRepository(
      path.resolve(process.cwd(), '..', 'docs', 'assets', 'bulletins_templates'),
    ),
  ) {}

  public async inspecter(template: BulletinTemplateDocumentaire): Promise<BulletinTemplatePackageReadModel> {
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
    if (backgroundMasterPresent && backgroundManifest?.statutPreparation !== 'NEUTRALISE_DISPONIBLE') {
      anomalies.push('background.master.pdf present mais non neutralise');
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
        statutBackground: backgroundManifest?.statutPreparation,
      }),
      anomalies,
    };
  }

  private determinerNiveauPreparation(entree: {
    layoutManifestPresent: boolean;
    backgroundManifestPresent: boolean;
    backgroundMasterPresent: boolean;
    zoneCalibrationPresent: boolean;
    statutBackground?: string;
  }): BulletinTemplatePackageNiveauPreparation {
    if (!entree.layoutManifestPresent && !entree.backgroundManifestPresent) {
      return 'DECLARE';
    }

    if (
      entree.layoutManifestPresent
      && entree.backgroundManifestPresent
      && (!entree.backgroundMasterPresent || entree.statutBackground === 'SOURCE_REFERENCE')
    ) {
      return 'MANIFESTS_OK';
    }

    if (
      entree.layoutManifestPresent
      && entree.backgroundManifestPresent
      && entree.backgroundMasterPresent
      && entree.statutBackground !== 'NEUTRALISE_DISPONIBLE'
    ) {
      return 'PRET_POUR_CALIBRATION';
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
