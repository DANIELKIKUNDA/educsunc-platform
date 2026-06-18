import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { ListerGrillesTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';

export class ListerGrillesTarificationUseCase {
  constructor(private readonly depotGrilleTarification: DepotGrilleTarification) {}

  public async executer(input: ListerGrillesTarificationInput): Promise<GrilleTarificationOutput[]> {
    this.verifierActeurAutorise(input.roleActif);

    const grilles = await this.depotGrilleTarification.listerParEcoleEtAnnee(
      input.idEcole,
      input.idAnneeScolaire,
      input.actif,
    );

    return grilles
      .filter((grille) => input.typeFrais === undefined || grille.obtenirTypeFrais() === input.typeFrais)
      .map(versGrilleTarificationOutput);
  }

  private verifierActeurAutorise(roleActif?: string): void {
    if (roleActif !== 'ADMIN_SYSTEME_ECOLE') {
      throw new ErreurDroitsInsuffisants(
        "Seul l'admin systeme ecole peut consulter les grilles de tarification.",
      );
    }
  }
}
