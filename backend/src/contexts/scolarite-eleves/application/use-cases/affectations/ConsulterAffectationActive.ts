import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';

// Ce fichier contient le cas d'usage de consultation d'une affectation active.
export interface ConsulterAffectationActiveEntree { idInscriptionScolaire: string }
export interface SortieConsulterAffectationActive { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage retourne l'affectation active d'une inscription. */
export class ConsulterAffectationActive implements UseCase<ConsulterAffectationActiveEntree, SortieConsulterAffectationActive> {
  constructor(private readonly depotAffectation: DepotAffectationClasse) {}
  /** Execute la consultation. */
  public async executer(entree: ConsulterAffectationActiveEntree): Promise<SortieConsulterAffectationActive> {
    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(entree.idInscriptionScolaire);
    if (affectation === null) throw new ErreurRessourceIntrouvable('Affectation active introuvable.');
    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
