import { SyntheseScolariteEcoleReadModel } from '../read-models/SyntheseScolariteEcoleReadModel';
import { SyntheseScolariteOrganisationReadModel } from '../read-models/SyntheseScolariteOrganisationReadModel';
import { SyntheseScolariteEcoleSortieDTO } from '../dto/output/SyntheseScolariteEcoleSortieDTO';
import { SyntheseScolariteOrganisationSortieDTO } from '../dto/output/SyntheseScolariteOrganisationSortieDTO';

// Ce fichier transforme les read models de synthese en DTO de sortie.
/**
 * Ce mapper garde les tableaux de bord separes des agregats.
 */
export class SyntheseScolariteMapper {
  /** Transforme une synthese ecole en sortie applicative. */
  public static versSyntheseEcole(sortie: SyntheseScolariteEcoleReadModel): SyntheseScolariteEcoleSortieDTO {
    return { ...sortie };
  }

  /** Transforme une synthese organisation en sortie applicative. */
  public static versSyntheseOrganisation(sortie: SyntheseScolariteOrganisationReadModel): SyntheseScolariteOrganisationSortieDTO {
    return { ...sortie };
  }
}
