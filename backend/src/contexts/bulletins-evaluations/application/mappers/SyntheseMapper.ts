import type { SyntheseResultatsEcole } from '../../domain/aggregates/SyntheseResultatsEcole';
import type { SyntheseEcoleOutput } from '../dto/output/SyntheseEcoleOutput';

// Ce mapper convertit une synthese d'ecole de domaine en DTO de sortie.
export class SyntheseMapper {
  // Cette methode produit une synthese exploitable par l'application.
  public versSortie(synthese: SyntheseResultatsEcole): SyntheseEcoleOutput {
    return {
      idSyntheseResultatsEcole: synthese.obtenirId(),
      idEcole: (synthese as unknown as { idEcole: string }).idEcole,
      idAnneeScolaire: (synthese as unknown as { idAnneeScolaire: string }).idAnneeScolaire,
      codeColonne: (synthese as unknown as { codeColonne: SyntheseEcoleOutput['codeColonne'] }).codeColonne,
      typeSynthese: (synthese as unknown as { typeSynthese: SyntheseEcoleOutput['typeSynthese'] }).typeSynthese,
      lignes: synthese.obtenirLignesSyntheseResultatsClasse().map((ligne) => ({
        idClassePedagogique: ligne.obtenirIdClassePedagogique(),
        libelleClasse: ligne.obtenirLibelleClasse(),
        statistiques: ligne.obtenirStatistiques().obtenirValeurs(),
      })),
      totauxEcole: synthese.obtenirTotauxSyntheseEcole()?.obtenirValeurs(),
    };
  }
}
