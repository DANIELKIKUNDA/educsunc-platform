import type { RecusPaiementReadModel } from '../../../application/read-models/RecusPaiementReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class RecusPaiementPresenter {
  public static presenterListe(recus: RecusPaiementReadModel): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEcole: recus.idEcole,
      filtres: { ...recus.filtres },
      recus: recus.recus.map((recu) => ({
        idRecu: recu.idRecu,
        numeroRecu: recu.numeroRecu,
        idPaiement: recu.idPaiement,
        idEleve: recu.idEleve,
        idCaissier: recu.idCaissier,
        dateEmission: PresentationHttpPaiementsFacturation.presenterDate(recu.dateEmission),
        heureEmission: recu.dateEmission.toISOString().slice(11, 19),
        modePaiement: recu.modePaiement,
        totalPaye: PresentationHttpPaiementsFacturation.presenterMontant(recu.totalPaye),
        statutRecu: recu.statutRecu,
      })),
    });
  }
}
