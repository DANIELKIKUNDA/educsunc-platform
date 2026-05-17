import type { MigrationBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/MigrationBulletinReadModel';
import type { MigrationBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/MigrationBulletinOutput';
import type { MigrationBulletin } from 'contexts/bulletins-evaluations/domain/aggregates/MigrationBulletin';
import type { DiffColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/DiffColonneBulletin';
import type { TransformationCoteBulletin } from 'contexts/bulletins-evaluations/domain/entities/TransformationCoteBulletin';

// Ce fichier centralise le mapping PostgreSQL des migrations de bulletin.
export class MigrationBulletinPostgresMapper {
  // Cette methode transforme une difference de migration en bloc de lecture stable.
  public static versDiff(diff: DiffColonneBulletin): MigrationBulletinOutput['diffs'][number] {
    return {
      typeDiff: diff.obtenirTypeDiff(),
      codeCours: diff.obtenirCodeCours(),
      codeColonne: diff.obtenirCodeColonne(),
      ancienMaximum: diff.obtenirAncienMaximum(),
      nouveauMaximum: diff.obtenirNouveauMaximum(),
      ancienOrdre: diff.obtenirAncienOrdre(),
      nouvelOrdre: diff.obtenirNouvelOrdre(),
      commentaire: diff.obtenirCommentaire(),
    };
  }

  // Cette methode transforme une transformation de cote en bloc de lecture stable.
  public static versTransformation(
    transformation: TransformationCoteBulletin,
  ): MigrationBulletinOutput['transformations'][number] {
    return {
      idEleve: transformation.obtenirIdEleve(),
      idReferentielCours: transformation.obtenirIdReferentielCours(),
      codeColonne: transformation.obtenirCodeColonne(),
      ancienneCote: transformation.obtenirAncienneCote(),
      nouvelleCote: transformation.obtenirNouvelleCote(),
      ancienMaximum: transformation.obtenirAncienMaximum(),
      nouveauMaximum: transformation.obtenirNouveauMaximum(),
      dateTransformation: transformation.obtenirDateTransformation(),
    };
  }

  // Cette methode transforme l'agregat de migration en read model complet.
  public static versReadModel(migration: MigrationBulletin): MigrationBulletinReadModel {
    return {
      idMigrationBulletin: migration.obtenirId(),
      idClassePedagogique: String(Reflect.get(migration, 'idClassePedagogique') ?? ''),
      idAnneeScolaire: String(Reflect.get(migration, 'idAnneeScolaire') ?? ''),
      ancienneVersionReferentiel: String(Reflect.get(migration, 'ancienneVersionReferentiel') ?? ''),
      nouvelleVersionReferentiel: String(Reflect.get(migration, 'nouvelleVersionReferentiel') ?? ''),
      statutMigration: migration.obtenirStatutMigration(),
      diffs: migration.obtenirDiffsColonnesBulletin().map((diff) => this.versDiff(diff)),
      transformations: migration.obtenirTransformationsCoteBulletin().map((transformation) => this.versTransformation(transformation)),
    };
  }
}
