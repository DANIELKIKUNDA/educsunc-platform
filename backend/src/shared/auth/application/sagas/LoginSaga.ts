import {
  ContexteActifAuth,
  DepotContexteActifAuth,
  DepotRefreshToken,
  DepotSessionUtilisateur,
  DepotTentativeConnexion,
  DepotUtilisateurAuth,
  ErreurMotDePasseInvalide,
  MoteurAuthentification,
  MoteurVerrouillageCompte,
  TentativeConnexion,
} from '../../domain';
import { LoginInput } from '../dto/input';
import { LoginOutput } from '../dto/output';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';
import { LoginMapper } from '../mappers/LoginMapper';
import { SessionMapper } from '../mappers/SessionMapper';
import { SecurityAuthorizationPort } from '../ports/security/SecurityAuthorizationPort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';
import { AuthentificationImpossibleApplicationException } from '../exceptions';

// Cette saga orchestre la sequence complete d'un login AUTH.
export class LoginSaga {
  constructor(
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly depotUtilisateurAuth: DepotUtilisateurAuth,
    private readonly depotSessionUtilisateur: DepotSessionUtilisateur,
    private readonly depotRefreshToken: DepotRefreshToken,
    private readonly depotContexteActifAuth: DepotContexteActifAuth,
    private readonly depotTentativeConnexion: DepotTentativeConnexion,
    private readonly securityAuthorizationPort: SecurityAuthorizationPort,
    private readonly auditAuthApplicationService: AuditAuthApplicationService,
    private readonly moteurAuthentification: MoteurAuthentification,
    private readonly moteurVerrouillageCompte = new MoteurVerrouillageCompte(),
  ) {}

  // Cette methode execute l'orchestration applicative complete du login.
  public async executer(input: LoginInput): Promise<LoginOutput> {
    const commande = LoginMapper.versCommande(input);
    for (let numeroEssai = 1; numeroEssai <= 3; numeroEssai += 1) {
      try {
        return await this.transactionManagerPort.executerDansTransaction(async () => {
      const utilisateur = await this.depotUtilisateurAuth.trouverParEmail(commande.email);
      if (!utilisateur) {
        await this.auditAuthApplicationService.journaliserEchec({
          email: commande.email,
          raison: 'Utilisateur introuvable',
          organisationActiveId: commande.organisationActiveId,
          ecoleActiveId: commande.ecoleActiveId,
          deviceId: commande.deviceId,
          adresseIp: commande.adresseIp,
          userAgent: commande.userAgent,
        });
        throw new AuthentificationImpossibleApplicationException();
      }

      await this.securityAuthorizationPort.verifierScopes(utilisateur.obtenirId());

      if (commande.organisationActiveId) {
        const accesOrganisation = await this.securityAuthorizationPort.verifierAccesOrganisation(utilisateur.obtenirId(), commande.organisationActiveId);
        if (!accesOrganisation) {
          await this.auditAuthApplicationService.journaliserEchec({
            email: commande.email,
            utilisateurId: utilisateur.obtenirId(),
            raison: 'Organisation active refusee',
            organisationActiveId: commande.organisationActiveId,
            ecoleActiveId: commande.ecoleActiveId,
            deviceId: commande.deviceId,
            adresseIp: commande.adresseIp,
            userAgent: commande.userAgent,
          });
          throw new Error('Organisation active refusee');
        }
      }

      if (commande.ecoleActiveId) {
        const accesEcole = await this.securityAuthorizationPort.verifierAccesEcole(utilisateur.obtenirId(), commande.ecoleActiveId);
        if (!accesEcole) {
          await this.auditAuthApplicationService.journaliserEchec({
            email: commande.email,
            utilisateurId: utilisateur.obtenirId(),
            raison: 'Ecole active refusee',
            organisationActiveId: commande.organisationActiveId,
            ecoleActiveId: commande.ecoleActiveId,
            deviceId: commande.deviceId,
            adresseIp: commande.adresseIp,
            userAgent: commande.userAgent,
          });
          throw new Error('Ecole active refusee');
        }
      }

      const roleActif = await this.securityAuthorizationPort.resoudreRoleActif?.(
        utilisateur.obtenirId(),
      );
      const permissions = await this.securityAuthorizationPort.resoudrePermissionsEffectives?.(
        utilisateur.obtenirId(),
      );

      const resultat = this.moteurAuthentification.authentifier({
        utilisateur,
        motDePasseClair: commande.motDePasse,
        organisationActiveId: commande.organisationActiveId,
        ecoleActiveId: commande.ecoleActiveId,
        adresseIp: commande.adresseIp,
        userAgent: commande.userAgent,
        deviceId: commande.deviceId,
        modeOffline: commande.modeOffline,
        roleActif,
      });

      await this.depotUtilisateurAuth.sauvegarder(utilisateur);
      await this.depotRefreshToken.sauvegarder(resultat.refreshToken);
      await this.depotSessionUtilisateur.sauvegarder(resultat.sessionUtilisateur);
      await this.depotTentativeConnexion.sauvegarder(resultat.tentativeConnexion);

      const contexteExistant = await this.depotContexteActifAuth.trouverContexteUtilisateur(
        utilisateur.obtenirId(),
      );
      const contexteActif = contexteExistant
        ?? ContexteActifAuth.creer(utilisateur.obtenirId());
      let contexteModifie = contexteExistant === null;
      const acteurPlateforme = roleActif !== undefined && [
        'MANAGER_SYSTEME',
        'OPERATEUR_SYSTEME',
        'SUPPORT_SYSTEME',
      ].includes(roleActif);
      if (
        acteurPlateforme
        && (contexteActif.obtenirOrganisationActiveId() || contexteActif.obtenirEcoleActiveId())
      ) {
        contexteActif.viderContexte();
        contexteModifie = true;
      }
      if (commande.organisationActiveId) {
        contexteActif.changerOrganisationActive(commande.organisationActiveId);
        contexteModifie = true;
      }
      if (commande.ecoleActiveId) {
        contexteActif.changerEcoleActive(commande.ecoleActiveId, true);
        contexteModifie = true;
      }
      if (contexteModifie) {
        await this.depotContexteActifAuth.sauvegarder(contexteActif);
      }

      await this.auditAuthApplicationService.journaliserConnexion({
        utilisateurId: utilisateur.obtenirId(),
        sessionId: resultat.sessionUtilisateur.obtenirId(),
        organisationActiveId: commande.organisationActiveId,
        ecoleActiveId: commande.ecoleActiveId,
        estOffline: Boolean(commande.modeOffline),
        deviceId: commande.deviceId,
        adresseIp: commande.adresseIp,
        userAgent: commande.userAgent,
      });

      const sessionSortie = SessionMapper.depuisDomaine(resultat.sessionUtilisateur);
      return {
        accessToken: resultat.jwtToken.obtenirValeur(),
        refreshToken: resultat.refreshTokenValue.obtenirValeur(),
        sessionId: sessionSortie.sessionId,
        utilisateur: {
          idUtilisateur: utilisateur.obtenirId(),
          nomComplet: utilisateur.obtenirNomComplet(),
          email: utilisateur.obtenirEmail().obtenirValeur(),
          etatCompte: utilisateur.obtenirEtatCompte(),
        },
        organisationActiveId: sessionSortie.organisationActiveId,
        ecoleActiveId: sessionSortie.ecoleActiveId,
        acteurCode: roleActif,
        permissions,
      };
        });
      } catch (erreur) {
        if (erreur instanceof ErreurMotDePasseInvalide) {
          await this.enregistrerEchecMotDePasse(commande);
          throw erreur;
        }
        if (LoginSaga.estConflitVersion(erreur) && numeroEssai < 3) {
          continue;
        }
        throw erreur;
      }
    }
    throw new Error('Le login Auth n a pas pu etre finalise apres les reprises concurrentes.');
  }

  private async enregistrerEchecMotDePasse(commande: ReturnType<typeof LoginMapper.versCommande>): Promise<void> {
    for (let numeroEssai = 1; numeroEssai <= 3; numeroEssai += 1) {
      try {
        await this.transactionManagerPort.executerDansTransaction(async () => {
          const utilisateur = await this.depotUtilisateurAuth.trouverParEmail(commande.email);
          if (!utilisateur) {
            return;
          }

          this.moteurVerrouillageCompte.enregistrerEchec(utilisateur);
          const tentative = TentativeConnexion.creer({
            email: commande.email,
            adresseIp: commande.adresseIp,
            userAgent: commande.userAgent,
          });
          tentative.marquerEchec('Mot de passe invalide');
          await this.depotUtilisateurAuth.sauvegarder(utilisateur);
          await this.depotTentativeConnexion.sauvegarder(tentative);
        });
        return;
      } catch (erreur) {
        if (LoginSaga.estConflitVersion(erreur) && numeroEssai < 3) {
          continue;
        }
        throw erreur;
      }
    }
  }

  private static estConflitVersion(erreur: unknown): boolean {
    return erreur instanceof Error && erreur.message.startsWith('Conflit de version');
  }
}
