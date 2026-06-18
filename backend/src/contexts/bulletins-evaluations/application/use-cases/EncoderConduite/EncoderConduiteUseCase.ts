import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import { HistoriqueEncodageConduite } from '../../../domain/entities/HistoriqueEncodageConduite';
import { MoteurApplicationConduite } from '../../../domain/services/MoteurApplicationConduite';
import type { EncoderConduiteInput } from '../../dto/input/EncoderConduiteInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { AutorisationConduitePort } from '../../ports/out/AutorisationConduitePort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';

// Ce use case orchestre l'encodage applicatif de la conduite.
export class EncoderConduiteUseCase {
  constructor(
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly autorisationConduitePort?: AutorisationConduitePort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly moteurApplicationConduite = new MoteurApplicationConduite(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode execute l'encodage de la conduite puis renvoie la projection actualisee.
  public async executer(input: EncoderConduiteInput): Promise<ResultatBulletinOutput> {
    return this.transactionManagerPort.executer(async () => {
      const resultat = await this.depotResultat.trouverParId(input.idResultatBulletinEleve);
      if (resultat === null) {
        throw new ApplicationException('Le resultat consolide demande est introuvable.', 'BULLETINS_RESULTAT_INTROUVABLE');
      }

      await this.autorisationConduitePort?.verifierEncodageConduite({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: resultat.obtenirIdEcole(),
        idClassePedagogique: resultat.obtenirIdClassePedagogique(),
        idAnneeScolaire: resultat.obtenirIdAnneeScolaire(),
      });

      const conduiteAvant = resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === input.codePeriode);
      const anciensPointsConduite = conduiteAvant?.obtenirPointsConduite() ?? null;
      const ancienneMentionConduite = conduiteAvant?.obtenirMentionConduite();
      this.moteurApplicationConduite.encoderConduite(resultat, input.codePeriode, input.pointsConduite, input.idUtilisateur);
      const conduiteApres = resultat.obtenirConduitesPeriodes().find((conduite) => conduite.obtenirCodePeriode() === input.codePeriode);
      if (conduiteApres === undefined) {
        throw new ApplicationException('La conduite de periode demandee est introuvable apres mutation.', 'BULLETINS_CONDUITE_INCOHERENTE');
      }

      await this.depotResultat.sauvegarder(resultat);
      await this.depotResultat.ajouterHistoriqueEncodageConduite(new HistoriqueEncodageConduite({
        idHistoriqueEncodageConduite: `${resultat.obtenirId()}-${String(input.codePeriode)}-${conduiteApres.obtenirDateEncodage()?.getTime() ?? Date.now()}`,
        idResultatBulletinEleve: resultat.obtenirId(),
        idEleve: resultat.obtenirIdEleve(),
        idClassePedagogique: resultat.obtenirIdClassePedagogique(),
        idAnneeScolaire: resultat.obtenirIdAnneeScolaire(),
        codePeriode: input.codePeriode,
        anciensPointsConduite,
        nouveauxPointsConduite: conduiteApres.obtenirPointsConduite(),
        ancienneMentionConduite,
        nouvelleMentionConduite: conduiteApres.obtenirMentionConduite(),
        encodeePar: input.idUtilisateur,
        dateEncodage: conduiteApres.obtenirDateEncodage() ?? new Date(),
      }));
      await this.eventBusPort?.publier(resultat.recupererEvenements(), {
        organisationId: input.idOrganisation,
        ecoleId: resultat.obtenirIdEcole(),
        utilisateurId: input.idUtilisateur,
      });
      const sortie = this.serviceProjectionLecture.projeterResultat(resultat);
      resultat.viderEvenements();
      return sortie;
    });
  }
}
