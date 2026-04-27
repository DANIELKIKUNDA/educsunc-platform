import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';

// Ce fichier contient le cas d'usage de liste des affectations par ecole.
export interface ListerAffectationsParAnneeEntree { idEcole: string; idAnneeScolaire?: string }

/** Ce cas d'usage liste les affectations actives d'une ecole, filtrable plus tard par annee. */
export class ListerAffectationsParAnnee implements UseCase<ListerAffectationsParAnneeEntree, AffectationClasseSortieDTO[]> {
  constructor(private readonly depotAffectation: DepotAffectationClasse) {}
  /** Execute la liste des affectations. */
  public async executer(entree: ListerAffectationsParAnneeEntree): Promise<AffectationClasseSortieDTO[]> {
    return (await this.depotAffectation.listerActivesParEcole(entree.idEcole)).map(AffectationClasseMapper.versSortie);
  }
}
