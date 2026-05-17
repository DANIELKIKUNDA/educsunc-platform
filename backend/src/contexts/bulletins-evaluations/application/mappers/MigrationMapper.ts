import type { MigrationBulletin } from '../../domain/aggregates/MigrationBulletin';
import type { MigrationBulletinOutput } from '../dto/output/MigrationBulletinOutput';

// Ce mapper convertit une migration de domaine en DTO de sortie.
export class MigrationMapper {
  // Cette methode produit une migration exploitable par l'application.
  public versSortie(migration: MigrationBulletin): MigrationBulletinOutput {
    return {
      idMigrationBulletin: migration.obtenirId(),
      idClassePedagogique: (migration as unknown as { idClassePedagogique: string }).idClassePedagogique,
      idAnneeScolaire: (migration as unknown as { idAnneeScolaire: string }).idAnneeScolaire,
      ancienneVersionReferentiel: (migration as unknown as { ancienneVersionReferentiel: string }).ancienneVersionReferentiel,
      nouvelleVersionReferentiel: (migration as unknown as { nouvelleVersionReferentiel: string }).nouvelleVersionReferentiel,
      statutMigration: migration.obtenirStatutMigration(),
      diffs: migration.obtenirDiffsColonnesBulletin().map((diff) => ({
        typeDiff: diff.obtenirTypeDiff(),
        codeCours: diff.obtenirCodeCours(),
        codeColonne: diff.obtenirCodeColonne(),
        ancienMaximum: diff.obtenirAncienMaximum(),
        nouveauMaximum: diff.obtenirNouveauMaximum(),
        ancienOrdre: diff.obtenirAncienOrdre(),
        nouvelOrdre: diff.obtenirNouvelOrdre(),
        commentaire: diff.obtenirCommentaire(),
      })),
      transformations: migration.obtenirTransformationsCoteBulletin().map((transformation) => ({
        idEleve: transformation.obtenirIdEleve(),
        idReferentielCours: transformation.obtenirIdReferentielCours(),
        codeColonne: transformation.obtenirCodeColonne(),
        ancienneCote: transformation.obtenirAncienneCote(),
        nouvelleCote: transformation.obtenirNouvelleCote(),
        ancienMaximum: transformation.obtenirAncienMaximum(),
        nouveauMaximum: transformation.obtenirNouveauMaximum(),
        dateTransformation: transformation.obtenirDateTransformation(),
      })),
    };
  }
}
