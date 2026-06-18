import { ProclamationClasse } from '../../../domain/aggregates/ProclamationClasse';
import type { DepotProclamationClasse } from '../../../domain/repositories/DepotProclamationClasse';
import { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';
import { EtatProclamation } from '../../../domain/value-objects/EtatProclamation';
import { TypeProclamation } from '../../../domain/value-objects/TypeProclamation';
import type { InitialiserProclamationClasseInput } from '../../dto/input/InitialiserProclamationClasseInput';
import type { ProclamationClasseOutput } from '../../dto/output/ProclamationClasseOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { AutorisationGenerationProclamationPort } from '../../ports/out/AutorisationGenerationProclamationPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionProclamation } from '../../services/ServiceProjectionProclamation';

// Ce use case initialise la proclamation brouillon qui servira ensuite a la generation officielle.
export class InitialiserProclamationClasseUseCase {
  constructor(
    private readonly depotProclamation: DepotProclamationClasse,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly autorisationGenerationProclamationPort?: AutorisationGenerationProclamationPort,
    private readonly serviceProjectionProclamation = new ServiceProjectionProclamation(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  public async executer(input: InitialiserProclamationClasseInput): Promise<ProclamationClasseOutput> {
    return this.transactionManagerPort.executer(async () => {
      await this.autorisationGenerationProclamationPort?.verifierInitialisationProclamation({
        idUtilisateur: input.creePar,
        idEcole: input.idEcole,
        idClassePedagogique: input.idClassePedagogique,
        idAnneeScolaire: input.idAnneeScolaire,
      });

      const proclamationExistante = await this.depotProclamation.trouverParClasseEtColonne(
        input.idClassePedagogique,
        input.codeColonne,
        input.idAnneeScolaire,
      );

      if (
        proclamationExistante !== null
        && proclamationExistante.obtenirEtatProclamation() !== EtatProclamation.ANNULEE
      ) {
        throw new ApplicationException(
          'Une proclamation active existe deja pour cette classe, cette annee et cette colonne.',
          'BULLETINS_PROCLAMATION_DEJA_INITIALISEE',
        );
      }

      const proclamation = ProclamationClasse.initialiser({
        idProclamationClasse: `proclamation-${input.idClassePedagogique}-${input.idAnneeScolaire}-${input.codeColonne}`,
        idEcole: input.idEcole,
        idClassePedagogique: input.idClassePedagogique,
        idAnneeScolaire: input.idAnneeScolaire,
        codeColonne: input.codeColonne,
        typeProclamation: this.determinerTypeProclamation(input.codeColonne),
        versionReferentielProgramme: input.versionReferentielProgramme,
        creePar: input.creePar,
        creeLe: new Date(),
      });

      await this.depotProclamation.sauvegarder(proclamation);
      await this.eventBusPort?.publier(proclamation.recupererEvenements());
      const sortie = this.serviceProjectionProclamation.projeter(proclamation);
      proclamation.viderEvenements();
      return sortie;
    });
  }

  private determinerTypeProclamation(codeColonne: CodeColonneBulletin): TypeProclamation {
    if ([CodeColonneBulletin.P1, CodeColonneBulletin.P2, CodeColonneBulletin.P3, CodeColonneBulletin.P4, CodeColonneBulletin.P5, CodeColonneBulletin.P6].includes(codeColonne)) {
      return TypeProclamation.PERIODE;
    }

    if ([CodeColonneBulletin.EX1, CodeColonneBulletin.EX2, CodeColonneBulletin.EX3].includes(codeColonne)) {
      return TypeProclamation.EXAMEN;
    }

    if ([CodeColonneBulletin.TOTAL_S1, CodeColonneBulletin.TOTAL_S2].includes(codeColonne)) {
      return TypeProclamation.SEMESTRE;
    }

    if ([CodeColonneBulletin.TOTAL_T1, CodeColonneBulletin.TOTAL_T2, CodeColonneBulletin.TOTAL_T3].includes(codeColonne)) {
      return TypeProclamation.TRIMESTRE;
    }

    return TypeProclamation.ANNUEL;
  }
}
