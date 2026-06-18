import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import type { AutorisationFamillePort } from '../../ports';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de retrait d'un responsable familial.
export interface RetirerResponsableFamilleEntree extends ContexteCommandeScolariteDTO {
  idFamille: string;
  idResponsableFamille: string;
}
export interface SortieRetirerResponsableFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage retire un responsable d'une famille. */
export class RetirerResponsableFamille implements UseCase<RetirerResponsableFamilleEntree, SortieRetirerResponsableFamille> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly autorisationFamille?: AutorisationFamillePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute le retrait du responsable. */
  public async executer(entree: RetirerResponsableFamilleEntree): Promise<SortieRetirerResponsableFamille> {
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
    famille.retirerResponsable(entree.idResponsableFamille, entree.idUtilisateur);
    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
