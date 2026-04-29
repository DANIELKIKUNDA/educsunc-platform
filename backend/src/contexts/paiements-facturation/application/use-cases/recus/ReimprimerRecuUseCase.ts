import type { ReimprimerRecuInput } from 'contexts/paiements-facturation/application/dto/input/RecusEntreeDTO';
import type { DepotRecuPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotRecuPaiement';
import type { RecuPaiementOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { versRecuPaiementOutput } from 'contexts/paiements-facturation/application/mappers/PaiementApplicationMapper';
import { ErreurGenerationRecuImpossible } from 'contexts/paiements-facturation/application/exceptions/ErreurGenerationRecuImpossible';

export interface DepotRecuPaiementLecture extends DepotRecuPaiement {
  trouverParId(idRecu: string): Promise<import('contexts/paiements-facturation/domain/aggregates/RecuPaiement').RecuPaiement | null>;
}

export class ReimprimerRecuUseCase {
  constructor(private readonly depotRecuPaiement: DepotRecuPaiementLecture) {}

  public async executer(input: ReimprimerRecuInput): Promise<RecuPaiementOutput> {
    const recu = await this.depotRecuPaiement.trouverParId(input.idRecu);
    if (recu === null) {
      throw new ErreurGenerationRecuImpossible('Le recu a reimprimer est introuvable.');
    }
    return versRecuPaiementOutput(recu);
  }
}
