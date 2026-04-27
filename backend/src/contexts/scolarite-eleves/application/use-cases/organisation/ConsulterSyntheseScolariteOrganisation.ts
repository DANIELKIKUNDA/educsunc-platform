import { UseCase } from '../../../../../shared/application/UseCase';
import { SyntheseScolariteOrganisationSortieDTO } from '../../dto/output/SyntheseScolariteOrganisationSortieDTO';

// Ce fichier contient le cas d'usage de synthese organisationnelle.
export interface ConsulterSyntheseScolariteOrganisationEntree { idOrganisation: string }

/** Ce cas d'usage retourne une synthese organisationnelle minimale avant branchement read-model. */
export class ConsulterSyntheseScolariteOrganisation implements UseCase<ConsulterSyntheseScolariteOrganisationEntree, SyntheseScolariteOrganisationSortieDTO> {
  /** Execute la consultation de synthese organisationnelle. */
  public async executer(entree: ConsulterSyntheseScolariteOrganisationEntree): Promise<SyntheseScolariteOrganisationSortieDTO> {
    return {
      idOrganisation: entree.idOrganisation,
      totalEcoles: 0,
      totalEleves: 0,
      totalElevesActifs: 0,
      totalFamilles: 0,
      totalInscriptionsActives: 0,
    };
  }
}
