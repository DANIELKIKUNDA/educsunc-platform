import { GererAssetsRecusUseCase } from '../../../application/use-cases/recus/GererAssetsRecusUseCase';
import { AssetsRecusValidator } from '../validators/AssetsRecusValidator';

export class AssetsRecusController {
  constructor(private readonly casUsage: GererAssetsRecusUseCase) {}

  public async consulterIdentiteEcole(headers: unknown): Promise<{ donnee: unknown }> {
    const entree = AssetsRecusValidator.validerConsultation({}, headers);
    return { donnee: await this.casUsage.consulterIdentiteEcole(entree) };
  }

  public async configurerIdentiteEcole(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = AssetsRecusValidator.validerIdentiteEcole(corps, headers);
    return { donnee: await this.casUsage.configurerIdentiteEcole(entree) };
  }

  public async consulterSignature(headers: unknown): Promise<{ donnee: unknown }> {
    const entree = AssetsRecusValidator.validerConsultation({}, headers);
    return { donnee: await this.casUsage.consulterSignatureUtilisateur(entree) };
  }

  public async configurerSignature(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = AssetsRecusValidator.validerSignatureUtilisateur(corps, headers);
    return { donnee: await this.casUsage.configurerSignatureUtilisateur(entree) };
  }

  public async telechargerLogo(headers: unknown): Promise<{ nomFichier: string; mimeType: string; contenu: Buffer }> {
    const entree = AssetsRecusValidator.validerConsultation({}, headers);
    return this.casUsage.telechargerLogoEcole(entree);
  }

  public async telechargerCachet(headers: unknown): Promise<{ nomFichier: string; mimeType: string; contenu: Buffer }> {
    const entree = AssetsRecusValidator.validerConsultation({}, headers);
    return this.casUsage.telechargerCachetEcole(entree);
  }

  public async telechargerSignature(headers: unknown): Promise<{ nomFichier: string; mimeType: string; contenu: Buffer }> {
    const entree = AssetsRecusValidator.validerConsultation({}, headers);
    return this.casUsage.telechargerSignatureUtilisateur(entree);
  }
}
