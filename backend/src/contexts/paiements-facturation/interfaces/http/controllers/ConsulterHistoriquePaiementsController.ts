import { ConsulterHistoriquePaiementsEleveUseCase } from '../../../application/use-cases/dettes/ConsulterHistoriquePaiementsEleveUseCase';
import { HistoriquePaiementsPresenter } from '../presenters/HistoriquePaiementsPresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce controleur expose l'historique de paiement d'un eleve.
export class ConsulterHistoriquePaiementsController {
  // Ce constructeur injecte le repository de lecture specialise.
  constructor(private readonly casUsage: ConsulterHistoriquePaiementsEleveUseCase) {}

  // Cette methode valide le parametre eleve puis presente l'historique correspondant.
  public async consulter(parametres: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerHistoriquePaiements(parametres, headers);
    const sortie = await this.casUsage.executer(entree);

    return HistoriquePaiementsPresenter.presenterHistorique(sortie);
  }
}
