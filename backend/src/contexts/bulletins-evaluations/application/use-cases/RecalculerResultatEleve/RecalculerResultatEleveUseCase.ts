import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import { MoteurCalculBulletin } from '../../../domain/services/MoteurCalculBulletin';
import type { RecalculerResultatEleveInput } from '../../dto/input/RecalculerResultatEleveInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre le recalcul des resultats consolides d'un eleve.
export class RecalculerResultatEleveUseCase {
  constructor(
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly depotFicheCotation: DepotFicheCotationEleveCours,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly moteurCalculBulletin = new MoteurCalculBulletin(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode recalcule puis projette les resultats consolides.
  public async executer(input: RecalculerResultatEleveInput): Promise<ResultatBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const resultat = await this.depotResultat.trouverParEleveInscription(input.idEleve, input.idInscriptionScolaire);
      if (resultat === null) {
        throw new ApplicationException('Le resultat consolide de l eleve est introuvable.', 'BULLETINS_RESULTAT_INTROUVABLE');
      }

      const fiches = await this.depotFicheCotation.listerParEleve(input.idEleve, input.idAnneeScolaire);
      this.moteurCalculBulletin.recalculer(resultat, fiches);
      await this.depotResultat.sauvegarder(resultat);
      await this.eventBusPort?.publier(resultat.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterResultat(resultat);
      resultat.viderEvenements();
      return sortie;
    });
  }
}
