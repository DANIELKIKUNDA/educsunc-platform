import type { HistoriquePaiementsEleveReadModel } from '../../../application/read-models/HistoriquePaiementsEleveReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente l'historique des paiements d'un eleve.
export class HistoriquePaiementsPresenter {
  // Cette methode transforme l'historique technique en reponse JSON lisible.
  public static presenterHistorique(
    historique: HistoriquePaiementsEleveReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEleve: historique.idEleve,
      paiements: historique.paiements.map((paiement) => ({
        idPaiement: paiement.idPaiement,
        creeLe: PresentationHttpPaiementsFacturation.presenterDate(paiement.creeLe),
        montantTotal: PresentationHttpPaiementsFacturation.presenterMontant(
          paiement.montantTotal,
        ),
        modePaiement: String(paiement.modePaiement),
        typeFraisDeclare: String(paiement.typeFraisDeclare),
        statutPaiement: String(paiement.statutPaiement),
      })),
    });
  }
}
