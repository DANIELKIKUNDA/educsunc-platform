import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import { MoteurCalculBulletin } from '../../../domain/services/MoteurCalculBulletin';
import { MoteurDiagnosticPedagogique } from '../../../domain/services/MoteurDiagnosticPedagogique';
import type { CriteresAnalysePedagogiquePort } from '../../ports/out/CriteresAnalysePedagogiquePort';
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
    private readonly moteurDiagnosticPedagogique = new MoteurDiagnosticPedagogique(),
    private readonly eventBusPort?: EventBusPort,
    private readonly criteresAnalysePedagogiquePort?: CriteresAnalysePedagogiquePort,
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
      const criteres = await this.criteresAnalysePedagogiquePort?.resoudreCriteresAnalysePedagogique({
        idEcole: resultat.obtenirIdEcole(),
        idClassePedagogique: resultat.obtenirIdClassePedagogique(),
        idAnneeScolaire: resultat.obtenirIdAnneeScolaire(),
        idProgrammeNiveau: resultat.obtenirIdProgrammeNiveau(),
      });

      for (const colonne of resultat.obtenirResultatsColonnes()) {
        const cotes = fiches
          .filter((fiche) => fiche.obtenirEstCalculable())
          .map((fiche) => fiche.obtenirCoteParColonne(colonne.obtenirCodeColonne()))
          .filter((cote): cote is NonNullable<typeof cote> => cote !== undefined);

        resultat.mettreAJourDiagnosticEchec(this.moteurDiagnosticPedagogique.calculer(
          `${resultat.obtenirId()}-${colonne.obtenirCodeColonne()}-diagnostic`,
          colonne.obtenirCodeColonne(),
          cotes,
          criteres,
        ));
      }

      await this.depotResultat.sauvegarder(resultat);
      await this.eventBusPort?.publier(resultat.recupererEvenements());
      const sortie = this.serviceProjectionLecture.projeterResultat(resultat);
      resultat.viderEvenements();
      return sortie;
    });
  }
}
