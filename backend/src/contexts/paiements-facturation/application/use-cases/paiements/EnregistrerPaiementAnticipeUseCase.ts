import type { EnregistrerPaiementAnticipeInput } from 'contexts/paiements-facturation/application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { CiblePaiement } from 'contexts/paiements-facturation/domain/value-objects/CiblePaiement';
import { EnregistrerPaiementUseCase } from './EnregistrerPaiementUseCase';

export class EnregistrerPaiementAnticipeUseCase {
  constructor(private readonly enregistrerPaiementUseCase: EnregistrerPaiementUseCase) {}

  public async executer(input: EnregistrerPaiementAnticipeInput): Promise<PaiementEnregistreOutput> {
    return this.enregistrerPaiementUseCase.executer({
      idEleve: input.idEleve,
      idEcole: input.idEcole,
      typeFraisDeclare: input.typeFraisDeclare,
      montant: input.montant,
      modePaiement: input.modePaiement,
      ciblePaiement: CiblePaiement.ANTICIPE,
      idCaissier: input.idCaissier,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
