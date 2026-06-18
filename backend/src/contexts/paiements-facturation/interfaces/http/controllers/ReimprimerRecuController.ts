import { ReimprimerRecuUseCase } from '../../../application/use-cases/recus/ReimprimerRecuUseCase';
import { TelechargerRecuPdfUseCase } from '../../../application/use-cases/recus/TelechargerRecuPdfUseCase';
import { PaiementPresenter } from '../presenters/PaiementPresenter';
import { ReimprimerRecuValidator } from '../validators/ReimprimerRecuValidator';

export class ReimprimerRecuController {
  constructor(
    private readonly casUsage: ReimprimerRecuUseCase,
    private readonly casUsagePdf?: TelechargerRecuPdfUseCase,
  ) {}

  public async consulter(parametres: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ReimprimerRecuValidator.valider(parametres, headers);
    const sortie = await this.casUsage.executer(entree);
    return PaiementPresenter.presenterRecuPaiementOfficiel(sortie);
  }

  public async telechargerPdf(
    parametres: unknown,
    headers: unknown,
  ): Promise<{ nomFichier: string; mimeType: string; contenu: Buffer }> {
    if (this.casUsagePdf === undefined) {
      throw new Error('Le telechargement PDF du recu nest pas configure.');
    }

    const entree = ReimprimerRecuValidator.valider(parametres, headers);
    return this.casUsagePdf.executer(entree);
  }
}
