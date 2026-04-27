import { UseCase } from '../../../../../shared/application/UseCase';
import { Famille } from '../../../domain/aggregates/Famille';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { CreerFamilleEntreeDTO } from '../../dto/input/CreerFamilleEntreeDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { FamilleMapper } from '../../mappers/FamilleMapper';

// Ce fichier contient le cas d'usage de creation d'une famille.
export interface SortieCreerFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage orchestre la creation d'une famille sans logique de persistance technique. */
export class CreerFamille implements UseCase<CreerFamilleEntreeDTO, SortieCreerFamille> {
  constructor(private readonly depotFamille: DepotFamille) {}

  /** Execute la creation de la famille. */
  public async executer(entree: CreerFamilleEntreeDTO): Promise<SortieCreerFamille> {
    const famille = Famille.creer({
      idFamille: entree.idFamille,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      codeFamille: entree.codeFamille,
      nomFamille: entree.nomFamille,
      adresse: entree.adresse,
      telephonePrincipal: entree.telephonePrincipal,
      email: entree.email,
      responsables: [],
      creePar: entree.idUtilisateur,
    });

    await this.depotFamille.sauvegarder(famille);

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
