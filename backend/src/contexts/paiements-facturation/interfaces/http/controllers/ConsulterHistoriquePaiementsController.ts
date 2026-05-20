import type { HistoriquePaiementsEleveReadModel } from '../../../application/read-models/HistoriquePaiementsEleveReadModel';
import { HistoriquePaiementsPresenter } from '../presenters/HistoriquePaiementsPresenter';
import { ParamValidator } from '../validators/ParamValidator';

// Ce contrat abstrait la lecture de l'historique sans imposer une implementation particuliere au controleur.
export interface HistoriquePaiementsEleveRepository {
  consulterParEleve(idEleve: string): Promise<HistoriquePaiementsEleveReadModel>;
}

// Ce controleur expose l'historique de paiement d'un eleve.
export class ConsulterHistoriquePaiementsController {
  // Ce constructeur injecte le repository de lecture specialise.
  constructor(private readonly repository: HistoriquePaiementsEleveRepository) {}

  // Cette methode valide le parametre eleve puis presente l'historique correspondant.
  public async consulter(parametres: unknown): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerHistoriquePaiements(parametres);
    const sortie = await this.repository.consulterParEleve(entree.idEleve);

    return HistoriquePaiementsPresenter.presenterHistorique(sortie);
  }
}
