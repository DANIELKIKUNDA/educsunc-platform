import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { ModifierEleveEntreeDTO } from '../../dto/input/ModifierEleveEntreeDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';
import { ServiceTransactionApplication, ServiceTransactionApplicationSansEffet } from '../../services/ServiceTransactionApplication';

// Ce fichier contient le cas d'usage de modification de l'identite d'un eleve.
export interface SortieModifierEleve { eleve: EleveDetailSortieDTO }

/**
 * Ce cas d'usage charge l'eleve, verifie la version attendue et delegue la modification au domaine.
 */
export class ModifierEleve implements UseCase<ModifierEleveEntreeDTO, SortieModifierEleve> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
    private readonly serviceTransaction: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {}

  /** Execute la modification de l'identite d'un eleve. */
  public async executer(entree: ModifierEleveEntreeDTO): Promise<SortieModifierEleve> {
    return this.serviceTransaction.executerDansTransaction(async () => {
      const eleve = await this.depotEleve.trouverParId(entree.idEleve);

      if (eleve === null) {
        throw new ErreurRessourceIntrouvable('Eleve introuvable.');
      }

      this.serviceConcurrence.verifierVersion(entree.versionAttendue, eleve.obtenirVersion());
      eleve.modifierIdentite({ ...entree, modifiePar: entree.idUtilisateur });
      await this.depotEleve.sauvegarder(eleve);

      return { eleve: EleveMapper.versDetail(eleve) };
    });
  }
}
