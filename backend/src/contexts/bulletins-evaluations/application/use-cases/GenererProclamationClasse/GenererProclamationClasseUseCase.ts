import { EleveAbandonProclamation } from '../../../domain/entities/EleveAbandonProclamation';
import { HistoriqueGenerationProclamation } from '../../../domain/entities/HistoriqueGenerationProclamation';
import { LigneProclamationClasse } from '../../../domain/entities/LigneProclamationClasse';
import type { DepotProclamationClasse } from '../../../domain/repositories/DepotProclamationClasse';
import type { DepotResultatBulletinEleve } from '../../../domain/repositories/DepotResultatBulletinEleve';
import type { GenererProclamationClasseInput } from '../../dto/input/GenererProclamationClasseInput';
import type { ProclamationClasseOutput } from '../../dto/output/ProclamationClasseOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { ScolariteElevesPort } from '../../ports/out/ScolariteElevesPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionProclamation } from '../../services/ServiceProjectionProclamation';
import { ServiceStatistiques } from '../../services/ServiceStatistiques';
import { StatutProclamationEleve } from '../../../domain/value-objects/StatutProclamationEleve';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';

// Ce use case orchestre la generation applicative d'une proclamation de classe.
export class GenererProclamationClasseUseCase {
  constructor(
    private readonly depotProclamation: DepotProclamationClasse,
    private readonly depotResultat: DepotResultatBulletinEleve,
    private readonly scolariteElevesPort: ScolariteElevesPort,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly serviceProjectionProclamation = new ServiceProjectionProclamation(),
    private readonly serviceStatistiques = new ServiceStatistiques(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  // Cette methode genere la proclamation puis renvoie sa projection.
  public async executer(input: GenererProclamationClasseInput): Promise<ProclamationClasseOutput> {
    return this.transactionManagerPort.executer(async () => {
      const proclamation = await this.depotProclamation.trouverParClasseEtColonne(
        input.idClassePedagogique,
        input.codeColonne,
        input.idAnneeScolaire,
      );
      if (proclamation === null) {
        throw new ApplicationException('La proclamation demandee est introuvable.', 'BULLETINS_PROCLAMATION_INTROUVABLE');
      }

      const resultats = await this.depotResultat.listerParClasse(input.idClassePedagogique, input.idAnneeScolaire);
      const lignes = await Promise.all(resultats.map(async (resultat, index) => {
        const eleve = await this.scolariteElevesPort.consulterEleve(resultat.obtenirIdEleve());
        const colonne = resultat.obtenirResultatsColonnes().find((element) => element.obtenirCodeColonne() === input.codeColonne);
        return new LigneProclamationClasse({
          idLigneProclamationClasse: `${proclamation.obtenirId()}-${index + 1}`,
          rang: colonne?.obtenirRang(),
          idEleve: resultat.obtenirIdEleve(),
          nomComplet: eleve?.nomComplet ?? `Eleve ${index + 1}`,
          sexe: eleve?.sexe ?? SexeEleve.M,
          totalObtenu: colonne?.obtenirTotalObtenu(),
          maximumGeneral: colonne?.obtenirMaximumGeneral(),
          pourcentage: colonne?.obtenirPourcentage(),
          statutProclamation: colonne?.obtenirEstNonClasse() ? StatutProclamationEleve.NON_CLASSE : StatutProclamationEleve.CLASSE,
        });
      }));

      const abandons = await Promise.all(resultats.map(async (resultat) => {
        const abandon = await this.scolariteElevesPort.verifierAbandon(resultat.obtenirIdEleve(), input.idAnneeScolaire);
        const eleve = await this.scolariteElevesPort.consulterEleve(resultat.obtenirIdEleve());
        if (abandon === null || eleve === null) {
          return null;
        }

        return new EleveAbandonProclamation({
          idEleve: abandon.idEleve,
          nomComplet: eleve.nomComplet,
          sexe: eleve.sexe,
          dateAbandon: abandon.dateAbandon,
          motifAbandon: abandon.motifAbandon,
        });
      }));

      proclamation.generer({
        lignesProclamation: lignes,
        elevesNonClasses: [],
        elevesAbandon: abandons.filter((abandon): abandon is EleveAbandonProclamation => abandon !== null),
        historiqueGeneration: new HistoriqueGenerationProclamation({
          idHistoriqueGenerationProclamation: `${proclamation.obtenirId()}-historique-${Date.now()}`,
          dateGeneration: new Date(),
          genereePar: input.idUtilisateur,
          motifGeneration: input.typeProclamation,
        }),
      });
      this.serviceStatistiques.calculerProclamation(proclamation);
      await this.depotProclamation.sauvegarder(proclamation);
      await this.eventBusPort?.publier(proclamation.recupererEvenements());
      const sortie = this.serviceProjectionProclamation.projeter(proclamation);
      proclamation.viderEvenements();
      return sortie;
    });
  }
}
