import { LigneDiffMigration } from '../../domain/entities/LigneDiffMigration';
import { LigneDiffMigrationSortie } from '../dto/output/LigneDiffMigrationSortie';

// Ce mapper transforme l'entite LigneDiffMigration en DTO de sortie applicatif.
export class LigneDiffMigrationApplicationMapper {
  // Cette methode projette une difference de migration de domaine vers un contrat de sortie stable.
  public static versSortie(ligneDiffMigration: LigneDiffMigration): LigneDiffMigrationSortie {
    return {
      typeDiff: ligneDiffMigration.obtenirTypeDiff(),
      codeCours: ligneDiffMigration.obtenirCodeCours(),
      anciennePonderation: ligneDiffMigration.obtenirAnciennePonderation()?.obtenirValeurs(),
      nouvellePonderation: ligneDiffMigration.obtenirNouvellePonderation()?.obtenirValeurs(),
      ancienOrdre: ligneDiffMigration.obtenirAncienOrdre(),
      nouvelOrdre: ligneDiffMigration.obtenirNouvelOrdre(),
      commentaire: ligneDiffMigration.obtenirCommentaire(),
    };
  }
}
