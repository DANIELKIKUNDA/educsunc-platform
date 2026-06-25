import type { DepotAssetsRecusPort } from 'contexts/paiements-facturation/application/ports/DepotAssetsRecusPort';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';
import type { BulletinDocumentAssetReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { ProclamationDocumentAssetReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';

function determinerMimeType(chemin: string): string {
  const extension = chemin.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

type AssetDocumentaire = BulletinDocumentAssetReadModel | ProclamationDocumentAssetReadModel;

// Cet adaptateur reutilise le stockage des assets documentaires ecole sans dupliquer la logique.
export class DocumentAssetsEcoleAdapter {
  constructor(
    private readonly depotAssetsRecus: DepotAssetsRecusPort,
    private readonly stockage: ServiceStockageFichier,
  ) {}

  public async telechargerLogo(idEcole: string): Promise<AssetDocumentaire | null> {
    const identite = await this.depotAssetsRecus.consulterIdentiteEcole(idEcole);
    return await this.telechargerDepuisChemin(identite?.logoUrl);
  }

  public async telechargerCachet(idEcole: string): Promise<AssetDocumentaire | null> {
    const identite = await this.depotAssetsRecus.consulterIdentiteEcole(idEcole);
    return await this.telechargerDepuisChemin(identite?.cachetUrl);
  }

  public async telechargerSignatureChefEtablissement(): Promise<null> {
    return null;
  }

  public async telechargerDrapeau(): Promise<null> {
    return null;
  }

  public async telechargerFiligrane(): Promise<null> {
    return null;
  }

  private async telechargerDepuisChemin(chemin?: string): Promise<AssetDocumentaire | null> {
    if (!chemin) {
      return null;
    }

    const contenu = await this.stockage.telecharger(chemin);
    if (!(contenu instanceof Buffer)) {
      return null;
    }

    return {
      nomFichier: chemin.split(/[\\/]/).pop() ?? 'asset',
      mimeType: determinerMimeType(chemin),
      contenu,
    };
  }
}
