import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';

// Ce fichier contient le cas d'usage de liste des affectations actives d'une classe.
export interface ListerElevesParClasseEntree { idClassePedagogique: string }

/** Ce cas d'usage liste les affectations actives d'une classe. */
export class ListerElevesParClasse implements UseCase<ListerElevesParClasseEntree, AffectationClasseSortieDTO[]> {
  constructor(private readonly depotAffectation: DepotAffectationClasse) {}
  /** Execute la liste des eleves par classe. */
  public async executer(entree: ListerElevesParClasseEntree): Promise<AffectationClasseSortieDTO[]> {
    return (await this.depotAffectation.listerActivesParClasse(entree.idClassePedagogique)).map(AffectationClasseMapper.versSortie);
  }
}
