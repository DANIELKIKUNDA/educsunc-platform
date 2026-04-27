import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage qui definit le responsable principal d'une famille.
export interface DefinirResponsablePrincipalEntree extends ContexteCommandeScolariteDTO {
  idFamille: string;
  idResponsableFamille: string;
}
export interface SortieDefinirResponsablePrincipal { famille: FamilleSortieDTO }

/** Ce cas d'usage garantit qu'un seul responsable est principal. */
export class DefinirResponsablePrincipal implements UseCase<DefinirResponsablePrincipalEntree, SortieDefinirResponsablePrincipal> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute le changement de responsable principal. */
  public async executer(entree: DefinirResponsablePrincipalEntree): Promise<SortieDefinirResponsablePrincipal> {
    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, famille.obtenirVersion());
    famille.definirResponsablePrincipal(entree.idResponsableFamille, entree.idUtilisateur);
    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
