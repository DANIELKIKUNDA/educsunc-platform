import { AnnulerPaiementUseCase } from '../../../application/use-cases/annulations/AnnulerPaiementUseCase';
import { AnnulerPaiementValidator } from '../validators/AnnulerPaiementValidator';

// Ce controleur gere l'entree HTTP d'annulation d'un paiement.
export class AnnulerPaiementController {
  // Ce constructeur injecte le cas d'usage d'annulation.
  constructor(private readonly casUsage: AnnulerPaiementUseCase) {}

  // Cette methode execute l'annulation puis retourne simplement l'identifiant produit.
  public async annuler(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): Promise<{ donnee: { idAnnulationPaiement: string } }> {
    const entree = AnnulerPaiementValidator.valider(parametres, corps, headers);
    const idAnnulationPaiement = await this.casUsage.executer(entree);

    return {
      donnee: {
        idAnnulationPaiement,
      },
    };
  }
}
