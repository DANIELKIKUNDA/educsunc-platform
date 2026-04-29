import type { GenererRecuPaiementInput } from 'contexts/paiements-facturation/application/dto/input/RecusEntreeDTO';
import type { RecuPaiementOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import { MoteurRecu } from 'contexts/paiements-facturation/domain/services/MoteurRecu';
import { versRecuPaiementOutput } from 'contexts/paiements-facturation/application/mappers/PaiementApplicationMapper';
import { ErreurGenerationRecuImpossible } from 'contexts/paiements-facturation/application/exceptions/ErreurGenerationRecuImpossible';

export class GenererRecuPaiementUseCase {
  constructor(
    private readonly depotPaiement: DepotPaiement,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly moteurRecu = new MoteurRecu(),
  ) {}

  public async executer(input: GenererRecuPaiementInput): Promise<RecuPaiementOutput[]> {
    const paiement = await this.depotPaiement.trouverParId(input.idPaiement);
    if (paiement === null) {
      throw new ErreurGenerationRecuImpossible('Le paiement a imprimer est introuvable.');
    }
    const obligations = await this.depotObligationFinanciere.listerParEleveEtAnnee(paiement.obtenirIdEcole(), paiement.obtenirIdEleve(), '');
    const recus = this.moteurRecu.generer(
      paiement,
      new Map(obligations.map((obligation) => [obligation.obtenirId(), obligation])),
      input.idCaissier,
    );
    return recus.map(versRecuPaiementOutput);
  }
}
