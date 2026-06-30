import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import type { LigneClassementOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneClassementOutput';
import type { ClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ClassementColonneClasse';
import type { LigneClassementEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneClassementEleve';

// Ce fichier centralise le mapping PostgreSQL des classements de classe.
export class ClassementPostgresMapper {
  // Cette methode transforme une ligne de classement domaine en ligne de lecture.
  public static versLigne(ligne: LigneClassementEleve): LigneClassementOutput {
    return {
      idEleve: ligne.obtenirIdEleve(),
      nomComplet: ligne.obtenirNomComplet(),
      sexe: ligne.obtenirSexe(),
      totalObtenu: ligne.obtenirTotalObtenu(),
      maximumGeneral: ligne.obtenirMaximumGeneral(),
      pourcentage: ligne.obtenirPourcentage(),
      rang: ligne.obtenirRang(),
      estNonClasse: ligne.obtenirEstNonClasse(),
    };
  }

  // Cette methode transforme un agregat de classement en read model de lecture.
  public static versReadModel(classement: ClassementColonneClasse): ClassementClasseReadModel {
    return {
      idClassementColonneClasse: classement.obtenirId(),
      idClassePedagogique: classement.obtenirIdClassePedagogique(),
      idAnneeScolaire: classement.obtenirIdAnneeScolaire(),
      codeColonne: classement.obtenirCodeColonne(),
      lignes: classement.obtenirLignesClassement().map((ligne) => this.versLigne(ligne)),
    };
  }
}
