import type {
  ProclamationDocumentAssetReadModel,
  ProclamationDocumentAssetsReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';

export interface ProclamationAssetsLoader {
  telechargerCachet?(idEcole: string): Promise<ProclamationDocumentAssetReadModel | null>;
  telechargerLogo?(idEcole: string): Promise<ProclamationDocumentAssetReadModel | null>;
  telechargerSignatureChefEtablissement?(idEcole: string): Promise<ProclamationDocumentAssetReadModel | null>;
}

// Ce service isole les assets documentaires facultatifs de proclamation.
export class ProclamationAssetsResolverService {
  constructor(private readonly loader?: ProclamationAssetsLoader) {}

  public async resoudre(idEcole?: string): Promise<ProclamationDocumentAssetsReadModel> {
    if (this.loader === undefined || idEcole === undefined) {
      return {};
    }

    const [logo, cachet, signatureChefEtablissement] = await Promise.all([
      this.loader.telechargerLogo?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerCachet?.(idEcole) ?? Promise.resolve(null),
      this.loader.telechargerSignatureChefEtablissement?.(idEcole) ?? Promise.resolve(null),
    ]);

    return {
      ...(logo ? { logo } : {}),
      ...(cachet ? { cachet } : {}),
      ...(signatureChefEtablissement ? { signatureChefEtablissement } : {}),
    };
  }
}
