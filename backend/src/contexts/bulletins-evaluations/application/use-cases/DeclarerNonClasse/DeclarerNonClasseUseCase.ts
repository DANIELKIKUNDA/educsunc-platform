import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import type { DeclarerNonClasseInput } from '../../dto/input/DeclarerNonClasseInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre la declaration applicative d'un non-classe.
export class DeclarerNonClasseUseCase {
  constructor(
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode marque une colonne comme non classee et renvoie le resultat mis a jour.
  public async executer(input: DeclarerNonClasseInput): Promise<ResultatBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const resultat = await this.depotResultat.trouverParEleveInscription('', input.idResultatBulletinEleve);
      if (resultat === null) {
        throw new ApplicationException('Le resultat consolide demande est introuvable.', 'BULLETINS_RESULTAT_INTROUVABLE');
      }

      resultat.marquerNonClasse(input.codeColonne);
      await this.depotResultat.sauvegarder(resultat);
      await this.eventBusPort?.publier(resultat.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterResultat(resultat);
      resultat.viderEvenements();
      return sortie;
    });
  }
}
