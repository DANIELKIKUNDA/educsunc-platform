import { ClassementColonneClasse } from '../../../domain/aggregates/ClassementColonneClasse';
import { LigneClassementEleve } from '../../../domain/entities/LigneClassementEleve';
import type { DepotClassementColonneClasse } from '../../../domain/repositories/DepotClassementColonneClasse';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import { MoteurClassementBulletin } from '../../../domain/services/MoteurClassementBulletin';
import type { RecalculerClassementInput } from '../../dto/input/RecalculerClassementInput';
import type { ClassementClasseOutput } from '../../dto/output/ClassementClasseOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { AutorisationClassementPort } from '../../ports/out/AutorisationClassementPort';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { ScolariteElevesPort } from '../../ports/out/ScolariteElevesPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionLecture } from '../../services/ServiceProjectionLecture';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';

// Ce use case orchestre le recalcul du classement d'une classe.
export class RecalculerClassementClasseUseCase {
  constructor(
    private readonly depotClassement: DepotClassementColonneClasse,
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly autorisationClassementPort?: AutorisationClassementPort,
    private readonly serviceProjectionLecture = new ServiceProjectionLecture(),
    private readonly moteurClassement = new MoteurClassementBulletin(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode recalcule puis projette le classement de classe.
  public async executer(input: RecalculerClassementInput): Promise<ClassementClasseOutput> {
    await this.autorisationClassementPort?.verifierRecalculClassementClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.transactionManagerPort.executer(async () => {
      let classement = await this.depotClassement.trouverParClasseEtColonne(
        input.idClassePedagogique,
        input.codeColonne,
        input.idAnneeScolaire,
      );

      const resultats = await this.depotResultat.listerParClasse(input.idClassePedagogique, input.idAnneeScolaire);
      if (resultats.length === 0) {
        throw new ApplicationException(
          'Aucun resultat consolide exploitable n est disponible pour recalculer ce classement.',
          'BULLETINS_RESULTATS_CLASSEMENT_INTROUVABLES',
        );
      }

      if (classement === null) {
        const resultatReference = resultats[0]!;
        classement = new ClassementColonneClasse({
          idClassementColonneClasse: `classement-${input.idClassePedagogique}-${input.idAnneeScolaire}-${input.codeColonne}`,
          idEcole: resultatReference.obtenirIdEcole(),
          idClassePedagogique: input.idClassePedagogique,
          idAnneeScolaire: input.idAnneeScolaire,
          codeColonne: input.codeColonne,
          typeStructureEvaluation: resultatReference.obtenirTypeStructureEvaluation(),
          dateCalcul: new Date(),
          lignesClassement: [],
        });
      }

      const lignes = await Promise.all(resultats.map(async (resultat, index) => {
        const colonne = resultat.obtenirResultatsColonnes().find((element) => element.obtenirCodeColonne() === input.codeColonne);
        const eleve = await this.scolariteElevesPort?.consulterEleve(resultat.obtenirIdEleve());
        return new LigneClassementEleve({
          idLigneClassementEleve: `${classement.obtenirId()}-${index + 1}`,
          idEleve: resultat.obtenirIdEleve(),
          sexe: eleve?.sexe ?? SexeEleve.M,
          totalObtenu: colonne?.obtenirTotalObtenu(),
          maximumGeneral: colonne?.obtenirMaximumGeneral(),
          pourcentage: colonne?.obtenirPourcentage(),
          rang: colonne?.obtenirRang(),
          estNonClasse: colonne?.obtenirEstNonClasse() ?? true,
        });
      }));

      this.moteurClassement.recalculerClassement(classement, lignes);
      await this.depotClassement.sauvegarder(classement);
      await this.eventBusPort?.publier(classement.recupererEvenements(), {
        organisationId: input.idOrganisation,
        ecoleId: classement.obtenirIdEcole(),
        utilisateurId: input.idUtilisateur,
      });
      const sortie = this.serviceProjectionLecture.projeterClassement(classement);
      classement.viderEvenements();
      return sortie;
    });
  }
}
