import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { ChangerEleveDeClasseEntreeDTO } from '../../dto/input/ChangerEleveDeClasseEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de changement de classe.
export interface SortieChangerEleveDeClasse { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage change la classe d'une affectation active. */
export class ChangerEleveDeClasse implements UseCase<ChangerEleveDeClasseEntreeDTO, SortieChangerEleveDeClasse> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute le changement de classe. */
  public async executer(entree: ChangerEleveDeClasseEntreeDTO): Promise<SortieChangerEleveDeClasse> {
    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(entree.idInscriptionScolaire);

    if (affectation === null) throw new ErreurRessourceIntrouvable('Affectation active introuvable.');

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, affectation.obtenirVersion());
    affectation.changerClasse(entree.idNouvelleClassePedagogique, entree.motifAffectation, entree.idUtilisateur);
    await this.depotAffectation.sauvegarder(affectation);

    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
