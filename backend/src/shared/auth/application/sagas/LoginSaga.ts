import {
  ContexteActifAuth,
  DepotContexteActifAuth,
  DepotRefreshToken,
  DepotSessionUtilisateur,
  DepotTentativeConnexion,
  DepotUtilisateurAuth,
  MoteurAuthentification,
} from '../../domain';
import { LoginInput } from '../dto/input';
import { LoginOutput } from '../dto/output';
import { AuditAuthApplicationService } from '../services/AuditAuthApplicationService';
import { LoginMapper } from '../mappers/LoginMapper';
import { LoginMapper as _UnusedAliasPreventRename } from '../mappers/LoginMapper';
import { SessionMapper } from '../mappers/SessionMapper';
import { SecurityAuthorizationPort } from '../ports/security/SecurityAuthorizationPort';
import { TransactionManagerPort } from '../ports/transaction/TransactionManagerPort';

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
  ) {
    void _UnusedAliasPreventRename;
  }

  // Cette methode execute l'orchestration applicative complete du login.
  public async executer(input: LoginInput): Promise<LoginOutput> {
    return this.transactionManagerPort.executerDansTransaction(async () => {
      const commande = LoginMapper.versCommande(input);
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
        throw new Error('Utilisateur auth introuvable');
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

      const resultat = this.moteurAuthentification.authentifier({
        utilisateur,
        motDePasseClair: commande.motDePasse,
        organisationActiveId: commande.organisationActiveId,
        ecoleActiveId: commande.ecoleActiveId,
        adresseIp: commande.adresseIp,
        userAgent: commande.userAgent,
        deviceId: commande.deviceId,
        modeOffline: commande.modeOffline,
      });

      await this.depotUtilisateurAuth.sauvegarder(utilisateur);
      await this.depotRefreshToken.sauvegarder(resultat.refreshToken);
      await this.depotSessionUtilisateur.sauvegarder(resultat.sessionUtilisateur);
      await this.depotTentativeConnexion.sauvegarder(resultat.tentativeConnexion);

      const contexteActif = (await this.depotContexteActifAuth.trouverContexteUtilisateur(utilisateur.obtenirId()))
        ?? ContexteActifAuth.creer(utilisateur.obtenirId());
      if (commande.organisationActiveId) {
        contexteActif.changerOrganisationActive(commande.organisationActiveId);
      }
      if (commande.ecoleActiveId) {
        contexteActif.changerEcoleActive(commande.ecoleActiveId, true);
      }
      await this.depotContexteActifAuth.sauvegarder(contexteActif);

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
        expireLe: resultat.sessionUtilisateur.obtenirExpireLe()?.toISOString(),
      };
    });
  }
}
