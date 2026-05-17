import type { ProclamationClasse } from '../../domain/aggregates/ProclamationClasse';
import type { ProclamationClasseOutput } from '../dto/output/ProclamationClasseOutput';

// Ce mapper convertit une proclamation de domaine en DTO de sortie.
export class ProclamationMapper {
  // Cette methode produit une proclamation complete exploitable par l'application.
  public versSortie(proclamation: ProclamationClasse): ProclamationClasseOutput {
    return {
      idProclamationClasse: proclamation.obtenirId(),
      idClassePedagogique: (proclamation as unknown as { idClassePedagogique: string }).idClassePedagogique,
      idAnneeScolaire: (proclamation as unknown as { idAnneeScolaire: string }).idAnneeScolaire,
      codeColonne: (proclamation as unknown as { codeColonne: ProclamationClasseOutput['codeColonne'] }).codeColonne,
      typeProclamation: (proclamation as unknown as { typeProclamation: ProclamationClasseOutput['typeProclamation'] }).typeProclamation,
      lignes: proclamation.obtenirLignesProclamation().map((ligne) => ({
        rang: ligne.obtenirRang(),
        idEleve: ligne.obtenirIdEleve(),
        nomComplet: ligne.obtenirNomComplet(),
        sexe: ligne.obtenirSexe(),
        totalObtenu: ligne.obtenirTotalObtenu(),
        maximumGeneral: ligne.obtenirMaximumGeneral(),
        pourcentage: ligne.obtenirPourcentage(),
        observation: ligne.obtenirObservation(),
        statutProclamation: ligne.obtenirStatutProclamation(),
      })),
      nonClasses: proclamation.obtenirElevesNonClasses().map((eleve) => ({
        idEleve: eleve.obtenirIdEleve(),
        nomComplet: eleve.obtenirNomComplet(),
        sexe: eleve.obtenirSexe(),
        motifs: eleve.obtenirMotifs(),
        coursManquants: eleve.obtenirCoursManquants(),
        colonnesManquantes: eleve.obtenirColonnesManquantes(),
      })),
      abandons: proclamation.obtenirElevesAbandon().map((eleve) => ({
        idEleve: eleve.obtenirIdEleve(),
        nomComplet: eleve.obtenirNomComplet(),
        sexe: eleve.obtenirSexe(),
        dateAbandon: eleve.obtenirDateAbandon(),
        motifAbandon: eleve.obtenirMotifAbandon(),
      })),
      statistiques: proclamation.obtenirStatistiquesProclamation()?.obtenirValeurs(),
    };
  }
}
