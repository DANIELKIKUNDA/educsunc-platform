import type { ClassementColonneClasse } from '../../domain/aggregates/ClassementColonneClasse';
import type { ClassementClasseOutput } from '../dto/output/ClassementClasseOutput';

// Ce mapper convertit un classement de domaine en DTO de sortie.
export class ClassementMapper {
  // Cette methode produit un classement exploitable par l'application.
  public versSortie(classement: ClassementColonneClasse): ClassementClasseOutput {
    return {
      idClassementColonneClasse: classement.obtenirId(),
      idClassePedagogique: classement.obtenirIdClassePedagogique(),
      idAnneeScolaire: classement.obtenirIdAnneeScolaire(),
      codeColonne: classement.obtenirCodeColonne(),
      lignes: classement.obtenirLignesClassement().map((ligne) => ({
        idEleve: ligne.obtenirIdEleve(),
        sexe: ligne.obtenirSexe(),
        totalObtenu: ligne.obtenirTotalObtenu(),
        maximumGeneral: ligne.obtenirMaximumGeneral(),
        pourcentage: ligne.obtenirPourcentage(),
        rang: ligne.obtenirRang(),
        estNonClasse: ligne.obtenirEstNonClasse(),
      })),
    };
  }
}
