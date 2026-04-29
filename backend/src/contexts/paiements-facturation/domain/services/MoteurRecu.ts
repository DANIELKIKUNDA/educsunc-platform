import { Paiement } from '../aggregates/Paiement';
import { RecuPaiement } from '../aggregates/RecuPaiement';
import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';

export class MoteurRecu {
  public generer(paiement: Paiement, obligations: Map<string, ObligationFinanciereEleve>, idCaissier: string): RecuPaiement[] {
    return paiement.obtenirRepartitions().map((repartition, index) => {
      const obligation = obligations.get(repartition.obtenirIdObligation());

      if (obligation === undefined) {
        throw new Error('Impossible de generer un recu sans obligation cible.');
      }

      return RecuPaiement.creer({
        idRecu: `${paiement.obtenirId()}-RECU-${index + 1}`,
        numeroRecu: `${paiement.obtenirId()}-${index + 1}`,
        idPaiement: paiement.obtenirId(),
        idObligation: obligation.obtenirId(),
        idEcole: paiement.obtenirIdEcole(),
        idEleve: paiement.obtenirIdEleve(),
        typeFrais: obligation.obtenirTypeFrais(),
        referenceFrais: obligation.obtenirReferenceFrais(),
        libelle: obligation.obtenirLibelle(),
        montant: repartition.obtenirMontantAffecte(),
        montantEnLettres: `${repartition.obtenirMontantAffecte().obtenirMontant()} ${repartition.obtenirMontantAffecte().obtenirDevise()}`,
        modePaiement: paiement.obtenirModePaiement(),
        idCaissier,
        dateEmission: new Date(),
      });
    });
  }
}
