import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import type { AutorisationFamillePort } from '../../ports';

// Ce fichier contient le cas d'usage de consultation d'une famille.
export interface ConsulterFamilleEntree {
  idFamille: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}
export interface SortieConsulterFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage retourne une famille par identifiant. */
export class ConsulterFamille implements UseCase<ConsulterFamilleEntree, SortieConsulterFamille> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly depotEleve: DepotEleve,
    private readonly autorisationFamille?: AutorisationFamillePort,
  ) {}

  /** Execute la consultation d'une famille. */
  public async executer(entree: ConsulterFamilleEntree): Promise<SortieConsulterFamille> {
    await this.autorisationFamille?.verifierLectureFamille({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    const [elevesLies, nombreElevesActifs] = await Promise.all([
      this.depotEleve.trouverParFamille(entree.idFamille),
      this.depotFamille.compterElevesActifsDeFamille(entree.idFamille),
    ]);

    return {
      famille: FamilleMapper.versSortie(famille, {
        elevesLies,
        nombreElevesActifs,
      }),
    };
  }
}
