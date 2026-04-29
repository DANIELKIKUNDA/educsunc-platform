import type { EnregistrerPaiementArriereInput } from 'contexts/paiements-facturation/application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { CiblePaiement } from 'contexts/paiements-facturation/domain/value-objects/CiblePaiement';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';
import { EnregistrerPaiementUseCase } from './EnregistrerPaiementUseCase';

export class EnregistrerPaiementArriereUseCase {
  constructor(private readonly enregistrerPaiementUseCase: EnregistrerPaiementUseCase) {}

  public async executer(input: EnregistrerPaiementArriereInput): Promise<PaiementEnregistreOutput> {
    return this.enregistrerPaiementUseCase.executer({
      idEleve: input.idEleve,
      idEcole: input.idEcole,
      typeFraisDeclare: input.typeFraisDeclare ?? TypeFrais.FRAIS_SCOLAIRES,
      montant: input.montant,
      modePaiement: input.modePaiement,
      ciblePaiement: CiblePaiement.ARRIERE,
      idCaissier: input.idCaissier,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
