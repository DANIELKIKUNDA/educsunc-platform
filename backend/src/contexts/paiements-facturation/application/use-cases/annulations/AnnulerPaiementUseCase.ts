import type { AnnulerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotRecuPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotRecuPaiement';
import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { DepotAnnulationPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotAnnulationPaiement';
import { MoteurAnnulationPaiement } from 'contexts/paiements-facturation/domain/services/MoteurAnnulationPaiement';

export interface DepotRecuPaiementParPaiement extends DepotRecuPaiement {
  listerParPaiement(idPaiement: string): Promise<import('contexts/paiements-facturation/domain/aggregates/RecuPaiement').RecuPaiement[]>;
}

export class AnnulerPaiementUseCase {
  constructor(
    private readonly depotPaiement: DepotPaiement,
    private readonly depotRecuPaiement: DepotRecuPaiementParPaiement,
    private readonly depotCaisseJour: DepotCaisseJour,
    private readonly depotAnnulationPaiement: DepotAnnulationPaiement,
    private readonly moteurAnnulationPaiement = new MoteurAnnulationPaiement(),
  ) {}

  public async executer(input: AnnulerPaiementInput): Promise<string> {
    const paiement = await this.depotPaiement.trouverParId(input.idPaiement);
    if (paiement === null) {
      throw new Error('Le paiement a annuler est introuvable.');
    }
    const recus = await this.depotRecuPaiement.listerParPaiement(input.idPaiement);
    const caisse = await this.depotCaisseJour.trouverActiveParEcoleEtDate(paiement.obtenirIdEcole(), new Date().toISOString().slice(0, 10));
    if (caisse === null) {
      throw new Error('Aucune caisse active n a ete trouvee pour traiter cette annulation.');
    }
    const annulation = this.moteurAnnulationPaiement.annuler(paiement, recus, caisse, input.raison, input.annulePar);
    await this.depotPaiement.sauvegarder(paiement);
    await this.depotCaisseJour.sauvegarder(caisse);
    await this.depotAnnulationPaiement.sauvegarder(annulation);
    return annulation.obtenirId();
  }
}
