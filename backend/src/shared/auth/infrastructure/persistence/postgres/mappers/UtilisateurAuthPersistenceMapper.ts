import { UtilisateurAuth, AdresseEmail, EtatCompteUtilisateur, MotDePasseHash, TokenVersion } from '../../../../domain';

export interface UtilisateurAuthRecord {
  id_utilisateur: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  mot_de_passe_hash: string;
  etat_compte: string;
  token_version: number;
  dernier_acces_le?: string;
  dernier_login_le?: string;
  nombre_tentatives_connexion: number;
  compte_verrouille_jusqua?: string;
  auth_offline_autorisee: boolean;
  cree_le: string;
  modifie_le?: string;
  version: number;
  supprime_logiquement: boolean;
}

// Ce mapper convertit un utilisateur AUTH entre domaine et persistance.
export class UtilisateurAuthPersistenceMapper {
  public static versRecord(utilisateur: UtilisateurAuth): UtilisateurAuthRecord {
    return {
      id_utilisateur: utilisateur.obtenirId(),
      nom_complet: utilisateur.obtenirNomComplet(),
      email: utilisateur.obtenirEmail().obtenirValeur(),
      telephone: utilisateur.obtenirTelephone(),
      mot_de_passe_hash: utilisateur.obtenirMotDePasseHash().obtenirValeur(),
      etat_compte: utilisateur.obtenirEtatCompte(),
      token_version: utilisateur.obtenirTokenVersion().obtenirValeur(),
      dernier_acces_le: utilisateur.obtenirDernierAccesLe()?.toISOString(),
      dernier_login_le: utilisateur.obtenirDernierLoginLe()?.toISOString(),
      nombre_tentatives_connexion: utilisateur.obtenirNombreTentativesConnexion(),
      compte_verrouille_jusqua: utilisateur.obtenirCompteVerrouilleJusqua()?.toISOString(),
      auth_offline_autorisee: utilisateur.obtenirAuthOfflineAutorisee(),
      cree_le: utilisateur.obtenirCreeLe().toISOString(),
      modifie_le: utilisateur.obtenirModifieLe()?.toISOString(),
      version: utilisateur.obtenirVersion(),
      supprime_logiquement: utilisateur.obtenirSupprimeLogiquement(),
    };
  }

  public static depuisRecord(record: UtilisateurAuthRecord): UtilisateurAuth {
    return new UtilisateurAuth({
      idUtilisateur: record.id_utilisateur,
      nomComplet: record.nom_complet,
      email: new AdresseEmail(record.email),
      telephone: record.telephone,
      motDePasseHash: new MotDePasseHash(record.mot_de_passe_hash),
      etatCompte: record.etat_compte as EtatCompteUtilisateur,
      tokenVersion: new TokenVersion(record.token_version),
      dernierAccesLe: record.dernier_acces_le ? new Date(record.dernier_acces_le) : undefined,
      dernierLoginLe: record.dernier_login_le ? new Date(record.dernier_login_le) : undefined,
      nombreTentativesConnexion: record.nombre_tentatives_connexion,
      compteVerrouilleJusqua: record.compte_verrouille_jusqua ? new Date(record.compte_verrouille_jusqua) : undefined,
      authOfflineAutorisee: record.auth_offline_autorisee,
      creeLe: new Date(record.cree_le),
      modifieLe: record.modifie_le ? new Date(record.modifie_le) : undefined,
      version: record.version,
      supprimeLogiquement: record.supprime_logiquement,
    });
  }
}
