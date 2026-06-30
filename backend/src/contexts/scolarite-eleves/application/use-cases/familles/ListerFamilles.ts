import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { PaginationEntreeDTO } from '../../dto/input/PaginationEntreeDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { PageResultatSortieDTO } from '../../dto/output/PageResultatSortieDTO';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import type { AutorisationFamillePort } from '../../ports';
import { ServiceApplicationPagination } from '../../services/ServiceApplicationPagination';

// Ce fichier contient le cas d'usage de liste des familles.
export interface ListerFamillesEntree extends PaginationEntreeDTO {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  nomFamille?: string;
  nomResponsable?: string;
  nomEleve?: string;
}

/** Ce cas d'usage liste les familles d'une ecole avec pagination. */
export class ListerFamilles implements UseCase<ListerFamillesEntree, PageResultatSortieDTO<FamilleSortieDTO>> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly depotEleve: DepotEleve,
    private readonly autorisationFamille?: AutorisationFamillePort,
    private readonly servicePagination: ServiceApplicationPagination = new ServiceApplicationPagination(),
  ) {}

  /** Execute la liste des familles. */
  public async executer(entree: ListerFamillesEntree): Promise<PageResultatSortieDTO<FamilleSortieDTO>> {
    await this.autorisationFamille?.verifierLectureFamille({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const pagination = this.servicePagination.normaliser(entree);
    const familles = await this.depotFamille.listerParEcole(entree.idEcole);
    const nomFamille = entree.nomFamille?.trim().toLowerCase();
    const nomResponsable = entree.nomResponsable?.trim().toLowerCase();
    const nomEleve = entree.nomEleve?.trim().toLowerCase();

    const famillesFiltrees: typeof familles = [];

    for (const famille of familles) {
      const proprietes = famille.versProprietes();

      if (nomFamille && !proprietes.nomFamille.toLowerCase().includes(nomFamille)) {
        continue;
      }

      if (
        nomResponsable
        && !proprietes.responsables.some((responsable) =>
          responsable.obtenirNomComplet().toLowerCase().includes(nomResponsable))
      ) {
        continue;
      }

      if (nomEleve) {
        const elevesLies = await this.depotEleve.trouverParFamille(famille.obtenirId());
        const eleveCorrespond = elevesLies.some((eleve) =>
          [eleve.obtenirNom(), eleve.obtenirPostNom(), eleve.obtenirPrenom()]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(nomEleve));

        if (!eleveCorrespond) {
          continue;
        }
      }

      famillesFiltrees.push(famille);
    }

    return {
      donnees: this.servicePagination
        .paginer(famillesFiltrees, pagination)
        .map((famille) => FamilleMapper.versSortie(famille)),
      total: famillesFiltrees.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
