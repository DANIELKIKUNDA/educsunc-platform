import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';

// Ce fichier contient le cas d'usage de liste des inscriptions actives d'une ecole et d'une annee.
export interface ListerInscriptionsActivesEntree {
  idEcole: string;
  idAnneeScolaire: string;
}

/** Ce cas d'usage liste les inscriptions actives connues pour une ecole et une annee. */
export class ListerInscriptionsActives implements UseCase<ListerInscriptionsActivesEntree, InscriptionScolaireSortieDTO[]> {
  constructor(private readonly depotInscription: DepotInscriptionScolaire) {}

  /** Execute la liste des inscriptions actives. */
  public async executer(entree: ListerInscriptionsActivesEntree): Promise<InscriptionScolaireSortieDTO[]> {
    const inscriptions = await this.depotInscription.listerParEcoleEtAnnee(entree.idEcole, entree.idAnneeScolaire);
    return inscriptions.filter((inscription) => inscription.estActive()).map(InscriptionScolaireMapper.versSortie);
  }
}
