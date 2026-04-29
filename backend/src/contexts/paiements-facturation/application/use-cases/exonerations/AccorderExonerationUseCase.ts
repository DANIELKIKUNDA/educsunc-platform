import type { AccorderExonerationInput } from 'contexts/paiements-facturation/application/dto/input/ExonerationsEntreeDTO';
import type { ExonerationOutput } from 'contexts/paiements-facturation/application/dto/output/ExonerationsSortieDTO';
import type { DepotExoneration } from 'contexts/paiements-facturation/domain/repositories/DepotExoneration';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import { Exoneration } from 'contexts/paiements-facturation/domain/aggregates/Exoneration';
import { versExonerationOutput } from 'contexts/paiements-facturation/application/mappers/ExonerationApplicationMapper';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export class AccorderExonerationUseCase {
  constructor(
    private readonly depotExoneration: DepotExoneration,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
  ) {}

  public async executer(input: AccorderExonerationInput): Promise<ExonerationOutput> {
    const obligation = await this.depotObligationFinanciere.trouverParId(input.idObligation);
    if (obligation === null) {
      throw new Error('L obligation a exonérer est introuvable.');
    }
    const montantExonere = input.montantExonere
      ?? new Money(Math.floor(obligation.obtenirSolde().obtenirMontant() * ((input.pourcentage ?? 0) / 100)), obligation.obtenirSolde().obtenirDevise());
    const exoneration = Exoneration.accorder({
      idExoneration: `${input.idObligation}-EXO-${Date.now()}`,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      idObligation: input.idObligation,
      typeExoneration: input.typeExoneration,
      montantExonere,
      pourcentage: input.pourcentage,
      raison: input.raison,
      validePar: input.validePar,
    });
    obligation.appliquerExoneration(montantExonere);
    await this.depotObligationFinanciere.sauvegarder(obligation);
    await this.depotExoneration.sauvegarder(exoneration);
    return versExonerationOutput(exoneration);
  }
}
