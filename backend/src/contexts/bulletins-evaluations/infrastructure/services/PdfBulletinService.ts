import type { BulletinPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';
import { BulletinMasterBackgroundManifestFileRepository } from './BulletinMasterBackgroundManifestFileRepository';
import { BulletinDocumentDataBuilderService } from './BulletinDocumentDataBuilderService';
import { BulletinOverlayPlanBuilderService } from './BulletinOverlayPlanBuilderService';
import { BulletinPdfOverlayRendererService } from './BulletinPdfOverlayRendererService';
import { BulletinTemplatePackageInspectorService } from './BulletinTemplatePackageInspectorService';
import { BulletinTemplateLayoutRegistryService } from './BulletinTemplateLayoutRegistryService';
import { BulletinZoneCalibrationFileRepository } from './BulletinZoneCalibrationFileRepository';

// Ce fichier porte la generation technique d'un export PDF de bulletin.
export class PdfBulletinService {
  // Ce constructeur injecte un stockage partage pour archiver les exports si necessaire.
  constructor(
    private readonly stockage?: ServiceStockageFichier,
    private readonly documentDataBuilder = new BulletinDocumentDataBuilderService(),
    private readonly templateLayoutRegistry = new BulletinTemplateLayoutRegistryService(),
    private readonly overlayPlanBuilder = new BulletinOverlayPlanBuilderService(),
    private readonly backgroundManifestRepository = new BulletinMasterBackgroundManifestFileRepository(),
    private readonly templatePackageInspector = new BulletinTemplatePackageInspectorService(),
    private readonly zoneCalibrationRepository = new BulletinZoneCalibrationFileRepository(),
    private readonly renderer = new BulletinPdfOverlayRendererService(),
  ) {}

  // Cette methode produit un document simple et stable a partir d'un read model.
  public async genererDepuisReadModel(bulletin: BulletinEleveReadModel): Promise<BulletinPdfGenere> {
    const documentData = await this.documentDataBuilder.construire(bulletin);
    const layout = await this.templateLayoutRegistry.resoudre(documentData.meta.templateDocumentaire);
    const overlayPlan = this.overlayPlanBuilder.construire(documentData, layout);
    const backgroundManifest = await this.backgroundManifestRepository.charger(
      documentData.meta.templateDocumentaire,
    );
    const packageTemplate = await this.templatePackageInspector.inspecter(
      documentData.meta.templateDocumentaire,
    );
    const calibration = await this.zoneCalibrationRepository.charger(
      documentData.meta.templateDocumentaire,
    );
    const pdf = await this.renderer.rendre(
      documentData,
      layout,
      overlayPlan,
      backgroundManifest,
      packageTemplate,
      calibration,
    );

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`bulletins/${pdf.nomFichier}`, Buffer.from(pdf.contenu));
    }

    return pdf;
  }
}
