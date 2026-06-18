import type { AccorderExonerationInput } from 'contexts/paiements-facturation/application/dto/input/ExonerationsEntreeDTO';
import type { ExonerationOutput } from 'contexts/paiements-facturation/application/dto/output/ExonerationsSortieDTO';
import type { AutorisationExonerationPort } from 'contexts/paiements-facturation/application/ports';
import { versExonerationOutput } from 'contexts/paiements-facturation/application/mappers/ExonerationApplicationMapper';
import { Exoneration } from 'contexts/paiements-facturation/domain/aggregates/Exoneration';
import type { DepotExoneration } from 'contexts/paiements-facturation/domain/repositories/DepotExoneration';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export class AccorderExonerationUseCase {
  constructor(
    private readonly depotExoneration: DepotExoneration,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly autorisationExoneration: AutorisationExonerationPort,
  ) {}

  public async executer(input: AccorderExonerationInput): Promise<ExonerationOutput> {
    await this.autorisationExoneration.verifierGestionExoneration({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
    });

    const obligation = await this.depotObligationFinanciere.trouverParId(input.idObligation);
    if (obligation === null) {
      throw new Error('L obligation a exonerer est introuvable.');
    }

    if (obligation.obtenirIdEcole() !== input.idEcole || obligation.obtenirIdEleve() !== input.idEleve) {
      throw new Error("L obligation a exonerer n appartient pas au perimetre demande.");
    }

    const montantExonere = input.montantExonere
      ?? new Money(
        Math.floor(
          obligation.obtenirSolde().obtenirMontant() * ((input.pourcentage ?? 0) / 100),
        ),
        obligation.obtenirSolde().obtenirDevise(),
      );

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
