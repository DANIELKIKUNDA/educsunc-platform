import type { AbandonReadModel } from 'contexts/bulletins-evaluations/application/read-models/AbandonReadModel';
import type { NonClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/NonClasseReadModel';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import type { AbandonOutput } from 'contexts/bulletins-evaluations/application/dto/output/AbandonOutput';
import type { LigneProclamationOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneProclamationOutput';
import type { NonClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/NonClasseOutput';
import type { ProclamationClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ProclamationClasse';
import type { EleveAbandonProclamation } from 'contexts/bulletins-evaluations/domain/entities/EleveAbandonProclamation';
import type { EleveNonClasseProclamation } from 'contexts/bulletins-evaluations/domain/entities/EleveNonClasseProclamation';
import type { LigneProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneProclamationClasse';
import type { StatistiquesProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/StatistiquesProclamationClasse';

// Ce fichier centralise le mapping PostgreSQL des proclamations de classe.
export class ProclamationPostgresMapper {
  // Cette methode transforme une ligne de proclamation domaine en DTO de lecture.
  public static versLigne(ligne: LigneProclamationClasse): LigneProclamationOutput {
    return {
      rang: ligne.obtenirRang(),
      idEleve: ligne.obtenirIdEleve(),
      nomComplet: ligne.obtenirNomComplet(),
      sexe: ligne.obtenirSexe(),
      totalObtenu: ligne.obtenirTotalObtenu(),
      maximumGeneral: ligne.obtenirMaximumGeneral(),
      pourcentage: ligne.obtenirPourcentage(),
      observation: ligne.obtenirObservation(),
      statutProclamation: ligne.obtenirStatutProclamation(),
    };
  }

  // Cette methode transforme un non-classe domaine en output/read model.
  public static versNonClasse(nonClasse: EleveNonClasseProclamation): NonClasseOutput | NonClasseReadModel {
    return {
      idEleve: nonClasse.obtenirIdEleve(),
      nomComplet: nonClasse.obtenirNomComplet(),
      sexe: nonClasse.obtenirSexe(),
      motifs: nonClasse.obtenirMotifs(),
      coursManquants: nonClasse.obtenirCoursManquants(),
      colonnesManquantes: nonClasse.obtenirColonnesManquantes(),
    };
  }

  // Cette methode transforme un abandon domaine en output/read model.
  public static versAbandon(abandon: EleveAbandonProclamation): AbandonOutput | AbandonReadModel {
    return {
      idEleve: abandon.obtenirIdEleve(),
      nomComplet: abandon.obtenirNomComplet(),
      sexe: abandon.obtenirSexe(),
      dateAbandon: abandon.obtenirDateAbandon(),
      motifAbandon: abandon.obtenirMotifAbandon(),
    };
  }

  // Cette methode transforme les statistiques domaine en vue de lecture.
  public static versStatistiques(statistiques: StatistiquesProclamationClasse | undefined): StatistiquesClasseReadModel | undefined {
    return statistiques?.obtenirValeurs();
  }

  // Cette methode transforme l'agregat proclamation en read model complet.
  public static versReadModel(proclamation: ProclamationClasse): ProclamationClasseReadModel {
    return {
      idProclamationClasse: proclamation.obtenirId(),
      idClassePedagogique: String(Reflect.get(proclamation, 'idClassePedagogique') ?? ''),
      idAnneeScolaire: String(Reflect.get(proclamation, 'idAnneeScolaire') ?? ''),
      codeColonne: Reflect.get(proclamation, 'codeColonne'),
      typeProclamation: Reflect.get(proclamation, 'typeProclamation'),
      lignes: proclamation.obtenirLignesProclamation().map((ligne) => this.versLigne(ligne)),
      nonClasses: proclamation.obtenirElevesNonClasses().map((nonClasse) => this.versNonClasse(nonClasse)),
      abandons: proclamation.obtenirElevesAbandon().map((abandon) => this.versAbandon(abandon)),
      statistiques: this.versStatistiques(proclamation.obtenirStatistiquesProclamation()),
    };
  }
}
