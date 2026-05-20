import { SessionUtilisateur } from '../aggregates/SessionUtilisateur';

// Ce moteur encapsule les regles de cycle de vie d'une session AUTH.
export class MoteurSession {
  // Cette methode ouvre une session selon les informations deja valides.
  public ouvrirSession(params: Parameters<typeof SessionUtilisateur.ouvrir>[0]): SessionUtilisateur {
    return SessionUtilisateur.ouvrir(params);
  }

  // Cette methode revoque une session existante avec une raison lisible.
  public revoquerSession(sessionUtilisateur: SessionUtilisateur, raisonRevocation?: string): void {
    sessionUtilisateur.revoquer(raisonRevocation);
  }

  // Cette methode marque un refresh sur une session encore valide.
  public rafraichirSession(sessionUtilisateur: SessionUtilisateur, dateRefresh = new Date()): void {
    sessionUtilisateur.verifierValidite(dateRefresh);
    sessionUtilisateur.marquerRefresh(dateRefresh);
  }

  // Cette methode verifie explicitement la validite d'une session.
  public verifierSession(sessionUtilisateur: SessionUtilisateur, maintenant = new Date()): void {
    sessionUtilisateur.verifierValidite(maintenant);
  }

  // Cette methode restaure le mode offline sur une session autorisee.
  public restaurerModeOffline(sessionUtilisateur: SessionUtilisateur): void {
    sessionUtilisateur.activerModeOffline();
  }
}
