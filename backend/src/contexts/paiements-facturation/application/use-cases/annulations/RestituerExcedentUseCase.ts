import type { RestituerExcedentInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import type { RestitutionOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotRestitution } from 'contexts/paiements-facturation/domain/repositories/DepotRestitution';
import { Restitution } from 'contexts/paiements-facturation/domain/aggregates/Restitution';
import { versRestitutionOutput } from 'contexts/paiements-facturation/application/mappers/PaiementApplicationMapper';

export class RestituerExcedentUseCase {
  constructor(
    private readonly depotPaiement: DepotPaiement,
    private readonly depotRestitution: DepotRestitution,
  ) {}

  public async executer(input: RestituerExcedentInput): Promise<RestitutionOutput> {
    const paiement = await this.depotPaiement.trouverParId(input.idPaiement);
    if (paiement === null) {
      throw new Error('Le paiement source de la restitution est introuvable.');
    }
    const restitution = new Restitution({
      idRestitution: `${input.idPaiement}-REST-${Date.now()}`,
      idPaiement: input.idPaiement,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      montant: paiement.obtenirMontantTotal(),
      raison: 'EXCEDENT',
      effectuePar: input.effectuePar,
      effectueLe: new Date(),
    });
    await this.depotRestitution.sauvegarder(restitution);
    return versRestitutionOutput(restitution);
  }
}
