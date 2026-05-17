import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import { MoteurApplicationConduite } from '../../../domain/services/MoteurApplicationConduite';
import type { EncoderConduiteInput } from '../../dto/input/EncoderConduiteInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre l'encodage applicatif de la conduite.
export class EncoderConduiteUseCase {
  constructor(
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly moteurApplicationConduite = new MoteurApplicationConduite(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode execute l'encodage de la conduite puis renvoie la projection actualisee.
  public async executer(input: EncoderConduiteInput): Promise<ResultatBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const resultat = await this.depotResultat.trouverParEleveInscription('', input.idResultatBulletinEleve);
      if (resultat === null) {
        throw new ApplicationException('Le resultat consolide demande est introuvable.', 'BULLETINS_RESULTAT_INTROUVABLE');
      }

      this.moteurApplicationConduite.encoderConduite(resultat, input.codePeriode, input.pointsConduite, input.idUtilisateur);
      await this.depotResultat.sauvegarder(resultat);
      await this.eventBusPort?.publier(resultat.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterResultat(resultat);
      resultat.viderEvenements();
      return sortie;
    });
  }
}
