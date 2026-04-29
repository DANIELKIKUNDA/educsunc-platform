import type { DepotGrilleTarification } from 'contexts/paiements-facturation/domain/repositories/DepotGrilleTarification';
import type { ListerGrillesTarificationInput } from 'contexts/paiements-facturation/application/dto/input/TarificationEntreeDTO';
import type { GrilleTarificationOutput } from 'contexts/paiements-facturation/application/dto/output/GrilleTarificationSortieDTO';
import { versGrilleTarificationOutput } from 'contexts/paiements-facturation/application/mappers/GrilleTarificationApplicationMapper';

export class ListerGrillesTarificationUseCase {
  constructor(private readonly depotGrilleTarification: DepotGrilleTarification) {}

  public async executer(input: ListerGrillesTarificationInput): Promise<GrilleTarificationOutput[]> {
    const grilles = await this.depotGrilleTarification.listerActivesParEcoleEtAnnee(
      input.idEcole,
      input.idAnneeScolaire ?? '',
    );

    return grilles
      .filter((grille) => input.typeFrais === undefined || grille.obtenirTypeFrais() === input.typeFrais)
      .filter((grille) => input.actif === undefined || grille.obtenirActif() === input.actif)
      .map(versGrilleTarificationOutput);
  }
}
