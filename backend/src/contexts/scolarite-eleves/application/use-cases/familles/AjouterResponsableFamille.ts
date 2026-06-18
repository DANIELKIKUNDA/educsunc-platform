import { UseCase } from '../../../../../shared/application/UseCase';
import { ResponsableFamille } from '../../../domain/entities/ResponsableFamille';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { AjouterResponsableFamilleEntreeDTO } from '../../dto/input/AjouterResponsableFamilleEntreeDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import type { AutorisationFamillePort } from '../../ports';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage d'ajout d'un responsable familial.
export interface SortieAjouterResponsableFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage ajoute un responsable a une famille existante. */
export class AjouterResponsableFamille implements UseCase<AjouterResponsableFamilleEntreeDTO, SortieAjouterResponsableFamille> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly autorisationFamille?: AutorisationFamillePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute l'ajout du responsable. */
  public async executer(entree: AjouterResponsableFamilleEntreeDTO): Promise<SortieAjouterResponsableFamille> {
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
    famille.ajouterResponsable(ResponsableFamille.creer(entree), entree.idUtilisateur);
    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
