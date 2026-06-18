import type { AnnulerExonerationInput } from 'contexts/paiements-facturation/application/dto/input/ExonerationsEntreeDTO';
import type { ExonerationOutput } from 'contexts/paiements-facturation/application/dto/output/ExonerationsSortieDTO';
import type { AutorisationExonerationPort } from 'contexts/paiements-facturation/application/ports';
import { versExonerationOutput } from 'contexts/paiements-facturation/application/mappers/ExonerationApplicationMapper';
import type { DepotExoneration } from 'contexts/paiements-facturation/domain/repositories/DepotExoneration';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';

export class AnnulerExonerationUseCase {
  constructor(
    private readonly depotExoneration: DepotExoneration,
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly autorisationExoneration: AutorisationExonerationPort,
  ) {}

  public async executer(input: AnnulerExonerationInput): Promise<ExonerationOutput> {
    const exoneration = await this.depotExoneration.trouverParId(input.idExoneration);
    if (exoneration === null) {
      throw new Error('L exoneration a annuler est introuvable.');
    }

    await this.autorisationExoneration.verifierGestionExoneration({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: exoneration.obtenirIdEleve(),
    });

    if (exoneration.obtenirIdEcole() !== input.idEcole) {
      throw new Error("L exoneration a annuler n appartient pas au perimetre demande.");
    }

    const obligation = await this.depotObligationFinanciere.trouverParId(
      exoneration.obtenirIdObligation(),
    );
    if (obligation === null) {
      throw new Error("L obligation rattachee a l exoneration est introuvable.");
    }

    if (
      obligation.obtenirIdEcole() !== input.idEcole
      || obligation.obtenirIdEleve() !== exoneration.obtenirIdEleve()
    ) {
      throw new Error(
        "L obligation rattachee a l exoneration ne correspond pas au perimetre demande.",
      );
    }

    obligation.retirerExoneration(exoneration.obtenirMontantExonere());
    exoneration.annuler();

    await this.depotObligationFinanciere.sauvegarder(obligation);
    await this.depotExoneration.sauvegarder(exoneration);

    return versExonerationOutput(exoneration);
  }
}
