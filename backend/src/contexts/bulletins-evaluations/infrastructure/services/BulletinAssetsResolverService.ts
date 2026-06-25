import type {
  BulletinDocumentAssetReadModel,
  BulletinDocumentAssetsReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';

export interface BulletinAssetsLoader {
  telechargerCachet?(idEcole: string): Promise<BulletinDocumentAssetReadModel | null>;
  telechargerDrapeau?(idEcole: string): Promise<BulletinDocumentAssetReadModel | null>;
  telechargerFiligrane?(idEcole: string): Promise<BulletinDocumentAssetReadModel | null>;
  telechargerLogo?(idEcole: string): Promise<BulletinDocumentAssetReadModel | null>;
  telechargerSignatureChefEtablissement?(idEcole: string): Promise<BulletinDocumentAssetReadModel | null>;
}

// Ce service isole la resolution des assets documentaires dependants de l'ecole.
export class BulletinAssetsResolverService {
  constructor(private readonly loader?: BulletinAssetsLoader) {}

  public async resoudre(bulletin: BulletinEleveReadModel): Promise<BulletinDocumentAssetsReadModel> {
    if (this.loader === undefined) {
      return {};
    }

    const idEcole = bulletin.idEcole;
    const [
      logo,
      cachet,
      signatureChefEtablissement,
      drapeau,
      filigrane,
    ] = await Promise.all([
      this.loader.telechargerLogo?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerCachet?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerSignatureChefEtablissement?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerDrapeau?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerFiligrane?.(idEcole) ?? Promise.resolve(null),
    ]);

    return {
      ...(logo ? { logo } : {}),
      ...(cachet ? { cachet } : {}),
      ...(signatureChefEtablissement ? { signatureChefEtablissement } : {}),
      ...(drapeau ? { drapeau } : {}),
      ...(filigrane ? { filigrane } : {}),
    };
  }
}
