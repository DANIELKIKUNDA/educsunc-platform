import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import type { StatistiquesEcoleReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesEcoleReadModel';
import type { LigneSyntheseOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneSyntheseOutput';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { SyntheseResultatsEcole } from 'contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole';
import type { LigneSyntheseResultatsClasse } from 'contexts/bulletins-evaluations/domain/entities/LigneSyntheseResultatsClasse';
import type { StatistiquesProclamationClasse } from 'contexts/bulletins-evaluations/domain/entities/StatistiquesProclamationClasse';
import type { TotauxSyntheseEcole } from 'contexts/bulletins-evaluations/domain/entities/TotauxSyntheseEcole';

// Ce fichier centralise le mapping PostgreSQL des syntheses globales de resultats.
export class SynthesePostgresMapper {
  // Cette methode transforme les statistiques domaine en vue de lecture.
  public static versStatistiques(
    statistiques: StatistiquesProclamationClasse | TotauxSyntheseEcole | undefined,
  ): StatistiquesClasseReadModel | StatistiquesEcoleReadModel | undefined {
    return statistiques?.obtenirValeurs();
  }

  // Cette methode transforme une ligne de synthese domaine en DTO.
  public static versLigne(ligne: LigneSyntheseResultatsClasse): LigneSyntheseOutput {
    return {
      idClassePedagogique: ligne.obtenirIdClassePedagogique(),
      libelleClasse: ligne.obtenirLibelleClasse(),
      statistiques: ligne.obtenirStatistiques().obtenirValeurs(),
    };
  }

  // Cette methode transforme l'agregat de synthese en DTO complet.
  public static versOutput(synthese: SyntheseResultatsEcole): SyntheseEcoleOutput {
    return {
      idSyntheseResultatsEcole: synthese.obtenirId(),
      idEcole: String(Reflect.get(synthese, 'idEcole') ?? ''),
      idAnneeScolaire: String(Reflect.get(synthese, 'idAnneeScolaire') ?? ''),
      codeColonne: Reflect.get(synthese, 'codeColonne'),
      typeSynthese: Reflect.get(synthese, 'typeSynthese'),
      lignes: synthese.obtenirLignesSyntheseResultatsClasse().map((ligne) => this.versLigne(ligne)),
      totauxEcole: this.versStatistiques(synthese.obtenirTotauxSyntheseEcole()) as StatistiquesEcoleReadModel | undefined,
    };
  }
}
