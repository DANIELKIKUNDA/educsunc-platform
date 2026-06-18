import { AnnulationPaiement } from '../aggregates/AnnulationPaiement';
import { CaisseJour } from '../aggregates/CaisseJour';
import { Paiement } from '../aggregates/Paiement';
import { RecuPaiement } from '../aggregates/RecuPaiement';
import { OperationCaisse } from '../entities/OperationCaisse';
import { OperationInverse } from '../entities/OperationInverse';
import { ModePaiement } from '../value-objects/ModePaiement';
import { TypeOperationCaisse } from '../value-objects/TypeOperationCaisse';

export class MoteurAnnulationPaiement {
  public annuler(paiement: Paiement, recus: RecuPaiement[], caisse: CaisseJour, raison: string, annulePar: string): AnnulationPaiement {
    paiement.annuler();
    recus.forEach((recu) => recu.annuler());

    const operationsInverses = paiement.obtenirRepartitions().map((repartition, index) => new OperationInverse({
      idOperationOrigine: repartition.obtenirIdRepartition(),
      idOperationInverse: `${paiement.obtenirId()}-INV-${index + 1}`,
      typeOperation: TypeOperationCaisse.ANNULATION,
      montant: repartition.obtenirMontantAffecte(),
      modePaiement: paiement.obtenirModePaiement() ?? ModePaiement.CASH,
      creeLe: new Date(),
    }));

    const annulation = new AnnulationPaiement({
      idAnnulation: `${paiement.obtenirId()}-ANNULATION`,
      idPaiement: paiement.obtenirId(),
      idEcole: paiement.obtenirIdEcole(),
      raison,
      annulePar,
      annuleLe: new Date(),
      operationsInverses,
    });

    caisse.ajouterOperation(new OperationCaisse({
      idOperation: `${annulation.obtenirId()}-CAISSE`,
      idPaiement: paiement.obtenirId(),
      idAnnulation: annulation.obtenirId(),
      typeOperation: TypeOperationCaisse.ANNULATION,
      montant: paiement.obtenirMontantTotal(),
      modePaiement: paiement.obtenirModePaiement() ?? ModePaiement.CASH,
      // La contre-operation de caisse neutralise la collecte initiale.
      // L'acteur qui a annule reste historise dans l'agregat AnnulationPaiement.
      idCaissier: paiement.obtenirCreePar(),
      dateOperation: new Date(),
    }));

    return annulation;
  }
}
