import { ContexteActifAuth } from '../aggregates/ContexteActifAuth';
import { SessionUtilisateur } from '../aggregates/SessionUtilisateur';
import { UtilisateurAuth } from '../aggregates/UtilisateurAuth';
import { ErreurSynchronisationAuth } from '../exceptions/ErreurSynchronisationAuth';
import { PolicyOfflineAuth } from '../policies/PolicyOfflineAuth';

// Ce moteur porte les regles de connexion et de reprise offline-first.
export class MoteurOfflineAuth {
  // Cette methode verifie si un utilisateur peut demarrer une authentification offline.
  public verifierAuthentificationOffline(utilisateur: UtilisateurAuth): void {
    PolicyOfflineAuth.verifier(utilisateur.obtenirAuthOfflineAutorisee(), true);
  }

  // Cette methode active le mode offline d'une session deja creee.
  public activerSessionOffline(sessionUtilisateur: SessionUtilisateur, utilisateur: UtilisateurAuth): void {
    this.verifierAuthentificationOffline(utilisateur);
    sessionUtilisateur.activerModeOffline();
  }

  // Cette methode prepare une reprise de synchronisation a partir du contexte courant.
  public preparerSynchronisation(
    sessionUtilisateur: SessionUtilisateur,
    contexteActifAuth: ContexteActifAuth,
  ): {
    idSessionUtilisateur: string;
    idUtilisateur: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
  } {
    if (!sessionUtilisateur.obtenirEstOffline()) {
      throw new ErreurSynchronisationAuth('La session n est pas en mode offline.');
    }

    return {
      idSessionUtilisateur: sessionUtilisateur.obtenirId(),
      idUtilisateur: sessionUtilisateur.obtenirIdUtilisateur(),
      organisationActiveId: contexteActifAuth.obtenirOrganisationActiveId(),
      ecoleActiveId: contexteActifAuth.obtenirEcoleActiveId(),
      estOffline: true,
    };
  }
}
