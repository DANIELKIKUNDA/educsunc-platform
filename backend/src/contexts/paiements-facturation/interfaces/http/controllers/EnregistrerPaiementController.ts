import { EnregistrerPaiementUseCase } from '../../../application/use-cases/paiements/EnregistrerPaiementUseCase';
import { PaiementPresenter } from '../presenters/PaiementPresenter';
import { EnregistrerPaiementValidator } from '../validators/EnregistrerPaiementValidator';

// Ce controleur relie la requete HTTP d'enregistrement a son cas d'usage applicatif.
export class EnregistrerPaiementController {
  // Ce constructeur injecte le cas d'usage d'enregistrement de paiement.
  constructor(private readonly casUsage: EnregistrerPaiementUseCase) {}

  // Cette methode valide la requete, execute le use case puis presente le resultat HTTP.
  public async enregistrer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = EnregistrerPaiementValidator.valider(corps, headers);
    const sortie = await this.casUsage.executer(entree);

    return PaiementPresenter.presenterPaiementEnregistre(sortie);
  }
}
