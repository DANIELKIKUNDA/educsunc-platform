import type {
  ConfigurerIdentiteDocumentaireEcoleInput,
  ConfigurerSignatureDocumentaireInput,
  ConsulterAssetRecuInput,
} from '../../dto/input/AssetsRecuEntreeDTO';
import type {
  FichierAssetRecuOutput,
  IdentiteDocumentaireEcoleOutput,
  SignatureDocumentaireUtilisateurOutput,
} from '../../dto/output/AssetsRecuSortieDTO';
import type { DepotAssetsRecusPort } from '../../ports/DepotAssetsRecusPort';
import type { ServiceStockageFichier } from '../../../../../shared/infrastructure/storage/FileStorageService';
import { ErreurDroitsInsuffisants } from '../../exceptions/ErreurDroitsInsuffisants';
import { ErreurGenerationRecuImpossible } from '../../exceptions/ErreurGenerationRecuImpossible';

type TypeAssetEcole = 'logo' | 'cachet';

function decoderBase64(contenuBase64: string): Buffer {
  return Buffer.from(contenuBase64, 'base64');
}

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

export class GererAssetsRecusUseCase {
  constructor(
    private readonly depotAssetsRecus: DepotAssetsRecusPort,
    private readonly stockage: ServiceStockageFichier,
  ) {}

  public async configurerIdentiteEcole(
    input: ConfigurerIdentiteDocumentaireEcoleInput,
  ): Promise<IdentiteDocumentaireEcoleOutput> {
    if (input.roleActif !== 'ADMIN_SYSTEME_ECOLE') {
      throw new ErreurDroitsInsuffisants(
        "Seul l'admin systeme ecole peut administrer le logo et le cachet des recus.",
      );
    }

    const existant = await this.depotAssetsRecus.consulterIdentiteEcole(input.idEcole);
    const logoUrl = input.logo === undefined
      ? existant?.logoUrl
      : await this.televerserAssetEcole(input.idEcole, 'logo', input.logo.extension, input.logo.contenuBase64);
    const cachetUrl = input.cachet === undefined
      ? existant?.cachetUrl
      : await this.televerserAssetEcole(input.idEcole, 'cachet', input.cachet.extension, input.cachet.contenuBase64);

    await this.depotAssetsRecus.sauvegarderIdentiteEcole({
      idEcole: input.idEcole,
      logoUrl,
      cachetUrl,
      misAJourPar: input.idUtilisateur,
    });

    return {
      idEcole: input.idEcole,
      logoUrl,
      cachetUrl,
    };
  }

  public async consulterIdentiteEcole(
    input: ConsulterAssetRecuInput,
  ): Promise<IdentiteDocumentaireEcoleOutput> {
    const identite = await this.depotAssetsRecus.consulterIdentiteEcole(input.idEcole);
    return {
      idEcole: input.idEcole,
      logoUrl: identite?.logoUrl,
      cachetUrl: identite?.cachetUrl,
    };
  }

  public async configurerSignatureUtilisateur(
    input: ConfigurerSignatureDocumentaireInput,
  ): Promise<SignatureDocumentaireUtilisateurOutput> {
    this.verifierRolePeutPorterSignatureDocumentaire(input.roleActif);

    const existant = await this.depotAssetsRecus.consulterSignatureUtilisateur(input.idUtilisateur);
    const signatureUrl = input.signature === undefined
      ? existant?.signatureUrl
      : await this.televerserSignatureUtilisateur(
        input.idUtilisateur,
        input.signature.extension,
        input.signature.contenuBase64,
      );

    await this.depotAssetsRecus.sauvegarderSignatureUtilisateur({
      idUtilisateur: input.idUtilisateur,
      signatureUrl,
      misAJourPar: input.idUtilisateur,
    });

    return {
      idUtilisateur: input.idUtilisateur,
      signatureUrl,
    };
  }

  public async consulterSignatureUtilisateur(
    input: ConsulterAssetRecuInput,
  ): Promise<SignatureDocumentaireUtilisateurOutput> {
    const signature = await this.depotAssetsRecus.consulterSignatureUtilisateur(
      input.idUtilisateur,
    );
    return {
      idUtilisateur: input.idUtilisateur,
      signatureUrl: signature?.signatureUrl,
    };
  }

  public async telechargerLogoEcole(input: ConsulterAssetRecuInput): Promise<FichierAssetRecuOutput> {
    return this.telechargerAssetEcole(input.idEcole, 'logo');
  }

  public async telechargerCachetEcole(input: ConsulterAssetRecuInput): Promise<FichierAssetRecuOutput> {
    return this.telechargerAssetEcole(input.idEcole, 'cachet');
  }

  public async telechargerSignatureUtilisateur(
    input: ConsulterAssetRecuInput,
  ): Promise<FichierAssetRecuOutput> {
    const signature = await this.depotAssetsRecus.consulterSignatureUtilisateur(
      input.idUtilisateur,
    );

    if (!signature?.signatureUrl) {
      throw new ErreurGenerationRecuImpossible('Aucune signature documentaire nest configuree.');
    }

    const contenu = await this.stockage.telecharger(signature.signatureUrl);
    if (!(contenu instanceof Buffer)) {
      throw new ErreurGenerationRecuImpossible('Le fichier de signature est introuvable.');
    }

    return {
      nomFichier: signature.signatureUrl.split(/[\\/]/).pop() ?? 'signature',
      mimeType: determinerMimeType(signature.signatureUrl),
      contenu,
    };
  }

  private async telechargerAssetEcole(
    idEcole: string,
    typeAsset: TypeAssetEcole,
  ): Promise<FichierAssetRecuOutput> {
    const identite = await this.depotAssetsRecus.consulterIdentiteEcole(idEcole);
    const chemin = typeAsset === 'logo' ? identite?.logoUrl : identite?.cachetUrl;

    if (!chemin) {
      throw new ErreurGenerationRecuImpossible(`Aucun ${typeAsset} documentaire n'est configure.`);
    }

    const contenu = await this.stockage.telecharger(chemin);
    if (!(contenu instanceof Buffer)) {
      throw new ErreurGenerationRecuImpossible(`Le fichier ${typeAsset} est introuvable.`);
    }

    return {
      nomFichier: chemin.split(/[\\/]/).pop() ?? typeAsset,
      mimeType: determinerMimeType(chemin),
      contenu,
    };
  }

  private async televerserAssetEcole(
    idEcole: string,
    typeAsset: TypeAssetEcole,
    extension: string,
    contenuBase64: string,
  ): Promise<string> {
    const chemin = `recus-assets/ecoles/${idEcole}/${typeAsset}.${extension}`;
    await this.stockage.televerser(chemin, decoderBase64(contenuBase64));
    return chemin;
  }

  private async televerserSignatureUtilisateur(
    idUtilisateur: string,
    extension: string,
    contenuBase64: string,
  ): Promise<string> {
    const chemin = `recus-assets/utilisateurs/${idUtilisateur}/signature.${extension}`;
    await this.stockage.televerser(chemin, decoderBase64(contenuBase64));
    return chemin;
  }

  private verifierRolePeutPorterSignatureDocumentaire(roleActif?: string): void {
    const rolesAutorises = new Set([
      'CAISSIER',
      'PREFET_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ]);

    if (roleActif !== undefined && rolesAutorises.has(roleActif)) {
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "Seuls les percepteurs autorises peuvent gerer une signature documentaire de recu.",
    );
  }
}
