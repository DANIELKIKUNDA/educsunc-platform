import { ErreurArchivageAcademique } from '../exceptions/ErreurArchivageAcademique';
import { EtatBulletin } from '../value-objects/EtatBulletin';
import { EtatProclamation } from '../value-objects/EtatProclamation';

// Cette policy fixe les conditions minimales d'archivage academique.
export class PolicyArchivageAcademique {
  // Cette methode verifie qu'un bulletin est dans un etat archivable.
  public verifierBulletin(etatBulletin: EtatBulletin): void {
    if (etatBulletin !== EtatBulletin.FINALISE) {
      throw new ErreurArchivageAcademique(
        'Seuls les bulletins finalises peuvent etre archives.',
      );
    }
  }

  // Cette methode verifie qu'une proclamation est dans un etat archivable.
  public verifierProclamation(etatProclamation: EtatProclamation): void {
    if (
      etatProclamation !== EtatProclamation.VALIDEE
      && etatProclamation !== EtatProclamation.VERROUILLEE
    ) {
      throw new ErreurArchivageAcademique(
        'Seules les proclamations validees ou verrouillees peuvent etre archivees.',
      );
    }
  }
}
