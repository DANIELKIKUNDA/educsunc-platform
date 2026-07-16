import { JwtToken } from '../value-objects/JwtToken';
import { PolicyOfflineAuth } from '../policies/PolicyOfflineAuth';
import { RefreshTokenValue } from '../value-objects/RefreshTokenValue';
import { RefreshToken } from '../aggregates/RefreshToken';
import { SessionUtilisateur } from '../aggregates/SessionUtilisateur';
import { TentativeConnexion } from '../aggregates/TentativeConnexion';
import { UtilisateurAuth } from '../aggregates/UtilisateurAuth';
import { ErreurMotDePasseInvalide } from '../exceptions/ErreurMotDePasseInvalide';

export interface DependancesMoteurAuthentification {
  verifierMotDePasse: (motDePasseClair: string, motDePasseHash: string) => boolean;
  genererJwt: (payload: {
    sub: string;
    sid: string;
    email: string;
    tokenVersion: number;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    roleActif?: string;
  }) => string;
  genererRefreshTokenValue: () => string;
  hacherRefreshToken: (refreshTokenValue: string) => string;
}

// Ce moteur orchestre la validation metier d'une authentification reussie.
export class MoteurAuthentification {
  constructor(private readonly dependances: DependancesMoteurAuthentification) {}

  // Cette methode realise un login domaine complet et ouvre une session persistante.
  public authentifier(params: {
    utilisateur: UtilisateurAuth;
    motDePasseClair: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    roleActif?: string;
    adresseIp?: string;
    userAgent?: string;
    deviceId?: string;
    modeOffline?: boolean;
  }): {
    jwtToken: JwtToken;
    refreshTokenValue: RefreshTokenValue;
    refreshToken: RefreshToken;
    sessionUtilisateur: SessionUtilisateur;
    tentativeConnexion: TentativeConnexion;
  } {
    const tentativeConnexion = TentativeConnexion.creer({
      email: params.utilisateur.obtenirEmail().obtenirValeur(),
      adresseIp: params.adresseIp,
      userAgent: params.userAgent,
    });

    const motDePasseValide = this.dependances.verifierMotDePasse(
      params.motDePasseClair,
      params.utilisateur.obtenirMotDePasseHash().obtenirValeur(),
    );
    if (!motDePasseValide) {
      tentativeConnexion.marquerEchec('Mot de passe invalide');
      throw new ErreurMotDePasseInvalide();
    }

    // Le statut du compte n'est evalue qu'apres preuve du secret afin d'eviter l'enumeration.
    params.utilisateur.verifierConnexionAutorisee();
    PolicyOfflineAuth.verifier(params.utilisateur.obtenirAuthOfflineAutorisee(), Boolean(params.modeOffline));

    tentativeConnexion.marquerSucces();
    params.utilisateur.marquerAuthentificationReussie(params.organisationActiveId, params.ecoleActiveId);

    const refreshTokenValue = new RefreshTokenValue(this.dependances.genererRefreshTokenValue());
    const refreshToken = RefreshToken.creer({
      idUtilisateur: params.utilisateur.obtenirId(),
      tokenHash: this.dependances.hacherRefreshToken(refreshTokenValue.obtenirValeur()),
      tokenVersionEmise: params.utilisateur.obtenirTokenVersion().obtenirValeur(),
    });
    const sessionUtilisateur = SessionUtilisateur.ouvrir({
      idUtilisateur: params.utilisateur.obtenirId(),
      refreshTokenId: refreshToken.obtenirId(),
      adresseIp: params.adresseIp,
      userAgent: params.userAgent,
      deviceId: params.deviceId,
      estOffline: Boolean(params.modeOffline),
      organisationActiveId: params.organisationActiveId,
      ecoleActiveId: params.ecoleActiveId,
    });
    refreshToken.associerSession(sessionUtilisateur.obtenirId());

    const jwtToken = new JwtToken(this.dependances.genererJwt({
      sub: params.utilisateur.obtenirId(),
      sid: sessionUtilisateur.obtenirId(),
      email: params.utilisateur.obtenirEmail().obtenirValeur(),
      tokenVersion: params.utilisateur.obtenirTokenVersion().obtenirValeur(),
      organisationActiveId: params.organisationActiveId,
      ecoleActiveId: params.ecoleActiveId,
      roleActif: params.roleActif,
    }));

    return {
      jwtToken,
      refreshTokenValue,
      refreshToken,
      sessionUtilisateur,
      tentativeConnexion,
    };
  }
}
