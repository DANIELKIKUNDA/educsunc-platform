import { UseCase } from '../../../../../shared/application/UseCase';
import { ResponsableFamille } from '../../../domain/entities/ResponsableFamille';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { AjouterResponsableFamilleEntreeDTO } from '../../dto/input/AjouterResponsableFamilleEntreeDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import type { AutorisationFamillePort } from '../../ports';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de modification d'un responsable familial.
export interface SortieModifierResponsableFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage remplace les informations d'un responsable deja present. */
export class ModifierResponsableFamille implements UseCase<AjouterResponsableFamilleEntreeDTO, SortieModifierResponsableFamille> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly autorisationFamille?: AutorisationFamillePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute la modification du responsable. */
  public async executer(entree: AjouterResponsableFamilleEntreeDTO): Promise<SortieModifierResponsableFamille> {
    await this.autorisationFamille?.verifierMutationFamille({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, famille.obtenirVersion());
    famille.modifierResponsable(ResponsableFamille.creer(entree), entree.idUtilisateur);
    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
