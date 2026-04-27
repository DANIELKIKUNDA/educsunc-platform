import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de modification des coordonnees d'une famille.
export interface ModifierFamilleEntree extends ContexteCommandeScolariteDTO {
  idFamille: string;
  nomFamille?: string;
  adresse?: string;
  telephonePrincipal?: string;
  email?: string;
}
export interface SortieModifierFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage modifie les coordonnees familiales via l'agregat. */
export class ModifierFamille implements UseCase<ModifierFamilleEntree, SortieModifierFamille> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute la modification des coordonnees. */
  public async executer(entree: ModifierFamilleEntree): Promise<SortieModifierFamille> {
    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, famille.obtenirVersion());
    famille.modifierCoordonnees({ ...entree, modifiePar: entree.idUtilisateur });
    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
