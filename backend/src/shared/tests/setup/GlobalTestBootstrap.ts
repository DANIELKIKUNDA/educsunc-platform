import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { requestContextPlugin } from '../../../app/plugins/request-context.plugin';
import { creerAuthenticationPlugin } from '../../../app/plugins/authentication.plugin';
import { creerSecurityPlugin } from '../../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../../app/plugins/tenancy.plugin';
import {
  AuthApplicationService,
  ContexteActifApplicationService,
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RevoquerToutesSessionsUtilisateurUseCase,
  ChangerEcoleActiveUseCase,
  ChangerOrganisationActiveUseCase,
  LoginSaga,
  LogoutSaga,
  RefreshTokenSaga,
  ChangerContexteActifSaga,
  SessionApplicationService,
  AuditAuthApplicationService,
} from 'shared/auth/application';
import {
  MoteurAuthentification,
  MoteurContexteActif,
  MoteurRefreshToken,
} from 'shared/auth/domain';
import { JwtTokenAdapter, SessionCacheService } from 'shared/auth/infrastructure';
import {
  SecurityAuthorizationPortMemoire,
  SecurityAuditPortMemoire,
  TenantContextPortMemoire,
  TransactionManagerMemoire,
  creerContexteActifAuth,
  creerRepositoriesMemoire as creerRepositoriesAuthMemoire,
  reinitialiserMemoireAuth,
  creerUtilisateurAuth,
} from 'shared/auth/tests/support/AuthTestSupport';
import { SecurityFacade } from 'shared/security/application/services/SecurityFacade';
import { MoteurAutorisation, MoteurCapacitesEffectives, MoteurRestrictionsMetier, MoteurScope } from 'shared/security/domain';
import { PermissionCacheService } from 'shared/security/infrastructure';
import {
  creerAffectationTitulariat,
  creerAffectationUtilisateur,
  creerRepositoriesMemoire as creerRepositoriesSecurityMemoire,
  creerRole,
  reinitialiserMemoireSecurity,
} from 'shared/security/tests/support/SecurityTestSupport';

// Ce fichier construit un mini-backend global pour exercer AUTH, SECURITY, TENANCY et les BC.

export interface ActeurGlobalTest {
  utilisateurId: string;
  email: string;
  roleCode: string;
  organisationId: string;
  ecoleId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  permissions: string[];
}

export interface ProfilActeurGlobal {
  codeRole: string;
  permissions: string[];
  restrictions?: string[];
  niveauAcces?: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  organisationId: string;
  ecoleId: string;
  sectionId?: string;
  classeId?: string;
  coursId?: string;
  titulaireClasseId?: string;
  titulaireAnneeScolaireId?: string;
  elevesAutorises?: string[];
  authOfflineAutorisee?: boolean;
}

interface MetaActeur {
  elevesAutorises: string[];
}

export class GlobalTestBootstrap {
  private static readonly jwtSecret = 'dev-secret-change-me';
  public readonly authRepositories = creerRepositoriesAuthMemoire();
  public readonly securityRepositories = creerRepositoriesSecurityMemoire();
  public readonly jwt = new JwtTokenAdapter(GlobalTestBootstrap.jwtSecret);
  public readonly authAudit = new SecurityAuditPortMemoire();
  public readonly sessionCache = new SessionCacheService();
  public readonly transactionManager = new TransactionManagerMemoire();
  public readonly securityFacade = new SecurityFacade(
    this.securityRepositories.roleRepository,
    this.securityRepositories.affectationRepository,
    this.securityRepositories.titulariatRepository,
    new PermissionCacheService(),
    new MoteurAutorisation(),
    new MoteurScope(),
    new MoteurRestrictionsMetier(),
    new MoteurCapacitesEffectives(),
  );

  private readonly loginUseCase: LoginUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly revoquerToutesSessionsUseCase: RevoquerToutesSessionsUtilisateurUseCase;
  private readonly changerEcoleActiveUseCase: ChangerEcoleActiveUseCase;
  private readonly changerOrganisationActiveUseCase: ChangerOrganisationActiveUseCase;
  private readonly metadonneesActeurs = new Map<string, MetaActeur>();

  constructor() {
    reinitialiserMemoireAuth();
    reinitialiserMemoireSecurity();

    const autorisationPort = new SecurityAuthorizationPortMemoire(
      ['org-a', 'org-b'],
      ['ecole-a-1', 'ecole-a-2', 'ecole-b-1'],
    );
    const auditService = new AuditAuthApplicationService(this.authAudit);
    const loginSaga = new LoginSaga(
      this.transactionManager,
      this.authRepositories.depotUtilisateurAuth,
      this.authRepositories.depotSessionUtilisateur,
      this.authRepositories.depotRefreshToken,
      this.authRepositories.depotContexteActifAuth,
      this.authRepositories.depotTentativeConnexion,
      autorisationPort,
      auditService,
      new MoteurAuthentification({
        verifierMotDePasse: (clair, hash) => clair === 'secret' && hash === 'hash-correct',
        genererJwt: (payload) => this.jwt.signerJwtSynchrone(payload),
        genererRefreshTokenValue: () => 'refresh-brut',
        hacherRefreshToken: (valeur) =>
          createHmac('sha256', GlobalTestBootstrap.jwtSecret).update(valeur).digest('hex'),
      }),
    );
    const logoutSaga = new LogoutSaga(
      this.transactionManager,
      this.authRepositories.depotSessionUtilisateur,
      this.authRepositories.depotRefreshToken,
      this.sessionCache,
      auditService,
    );
    const refreshSaga = new RefreshTokenSaga(
      this.transactionManager,
      this.authRepositories.depotRefreshToken,
      this.authRepositories.depotSessionUtilisateur,
      this.authRepositories.depotUtilisateurAuth,
      this.jwt,
      new MoteurRefreshToken({
        genererRefreshTokenValue: () => 'refresh-rotation',
        hacherRefreshToken: (valeur) =>
          createHmac('sha256', GlobalTestBootstrap.jwtSecret).update(valeur).digest('hex'),
      }),
      this.sessionCache,
    );
    const authService = new AuthApplicationService(
      loginSaga,
      logoutSaga,
      refreshSaga,
      { executer: async () => undefined } as never,
    );
    this.loginUseCase = new LoginUseCase(authService);
    this.logoutUseCase = new LogoutUseCase(authService);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authService);
    this.revoquerToutesSessionsUseCase = new RevoquerToutesSessionsUtilisateurUseCase(
      this.transactionManager,
      this.authRepositories.depotUtilisateurAuth,
      this.authRepositories.depotSessionUtilisateur,
      this.authRepositories.depotRefreshToken,
    );

    const contexteService = new ContexteActifApplicationService(
      this.authRepositories.depotContexteActifAuth,
      autorisationPort,
      new TenantContextPortMemoire(true),
      new MoteurContexteActif(),
    );
    this.changerOrganisationActiveUseCase = new ChangerOrganisationActiveUseCase(
      new SessionApplicationService(
        this.authRepositories.depotSessionUtilisateur,
        this.authRepositories.depotRefreshToken,
        this.sessionCache,
      ),
      new ChangerContexteActifSaga(this.transactionManager, contexteService),
    );
    this.changerEcoleActiveUseCase = new ChangerEcoleActiveUseCase(
      new SessionApplicationService(
        this.authRepositories.depotSessionUtilisateur,
        this.authRepositories.depotRefreshToken,
        this.sessionCache,
      ),
      new ChangerContexteActifSaga(this.transactionManager, contexteService),
    );
  }

  public async creerActeur(profil: ProfilActeurGlobal): Promise<ActeurGlobalTest> {
    const utilisateur = creerUtilisateurAuth({
      email: `${profil.codeRole.toLowerCase()}-${Math.random().toString(16).slice(2)}@educsync.test`,
      authOfflineAutorisee: profil.authOfflineAutorisee ?? true,
    });
    const role = creerRole({
      codeRole: profil.codeRole,
      nomRole: profil.codeRole,
      niveauAcces: profil.niveauAcces ?? 'ECOLE',
      permissions: profil.permissions,
    });
    for (const restriction of profil.restrictions ?? []) {
      role.ajouterRestriction(restriction, `Restriction ${restriction}`);
    }

    const affectation = creerAffectationUtilisateur({
      idUtilisateur: utilisateur.obtenirId(),
      idRole: role.obtenirId(),
      niveauAcces: profil.niveauAcces ?? 'ECOLE',
      idOrganisation: profil.organisationId,
      idEcole: profil.ecoleId,
      idSection: profil.sectionId,
      idClasse: profil.classeId,
      idCours: profil.coursId,
    });
    affectation.ajouterScope('ORGANISATION', profil.organisationId);
    affectation.ajouterScope('ECOLE', profil.ecoleId);
    if (profil.sectionId) {
      affectation.ajouterScope('SECTION', profil.sectionId);
    }
    if (profil.classeId) {
      affectation.ajouterScope('CLASSE', profil.classeId);
    }
    if (profil.coursId) {
      affectation.ajouterScope('COURS', profil.coursId);
    }

    await this.authRepositories.depotUtilisateurAuth.sauvegarder(utilisateur);
    await this.securityRepositories.roleRepository.sauvegarder(role);
    await this.securityRepositories.affectationRepository.sauvegarder(affectation);

    if (profil.titulaireClasseId) {
      const titulariat = creerAffectationTitulariat({
        idUtilisateur: utilisateur.obtenirId(),
        idOrganisation: profil.organisationId,
        idEcole: profil.ecoleId,
        idClasse: profil.titulaireClasseId,
        idAnneeScolaire: profil.titulaireAnneeScolaireId ?? 'annee-2026',
      });
      await this.securityRepositories.titulariatRepository.sauvegarder(titulariat);
    }

    const contexteActif = creerContexteActifAuth(
      utilisateur.obtenirId(),
      profil.organisationId,
      profil.ecoleId,
    );
    await this.authRepositories.depotContexteActifAuth.sauvegarder(contexteActif);

    const login = await this.loginUseCase.executer({
      email: utilisateur.obtenirEmail().obtenirValeur(),
      motDePasse: 'secret',
      organisationActiveId: profil.organisationId,
      ecoleActiveId: profil.ecoleId,
    });

    this.metadonneesActeurs.set(utilisateur.obtenirId(), {
      elevesAutorises: [...(profil.elevesAutorises ?? [])],
    });

    return {
      utilisateurId: utilisateur.obtenirId(),
      email: utilisateur.obtenirEmail().obtenirValeur(),
      roleCode: profil.codeRole,
      organisationId: profil.organisationId,
      ecoleId: profil.ecoleId,
      sessionId: login.sessionId,
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      deviceId: 'device-global-test',
      permissions: profil.permissions,
    };
  }

  public async creerServeur(): Promise<FastifyInstance> {
    const serveur = Fastify();
    await serveur.register(async (instance) => {
      await requestContextPlugin(instance, {});
      await this.creerAuthenticationPlugin()(instance, {});
      await this.creerSecurityPlugin()(instance, {});
      await tenancyPlugin(instance, {});

      instance.get('/probe/context', async (requete) => ({
        utilisateurId: requete.context.utilisateurId,
        sessionId: requete.context.sessionId,
        roleActif: requete.context.roleActif,
        organisationActiveId: requete.context.organisationActiveId,
        ecoleActiveId: requete.context.ecoleActiveId,
        permissions: [...requete.context.permissions],
        restrictions: [...requete.context.restrictions],
        scopes: requete.context.scopes.map((scope) => ({
          typeScope: scope.obtenirTypeScope().obtenirValeur(),
          valeurScope: scope.obtenirValeurScope(),
        })),
        titulariats: requete.context.titulariats.map((titulariat) => ({
          idClasse: titulariat.obtenirIdClasse(),
          idAnneeScolaire: titulariat.obtenirIdAnneeScolaire(),
        })),
      }));

      instance.post('/bc/bulletins/fiches/encoder', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'cotes.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_MODIFICATION_COTES',
          resultat: { action: 'fiche-encodee' },
        }));

      instance.post('/bc/bulletins/conduite', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'cotes.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_MODIFICATION_COTES',
          resultat: { action: 'conduite-encodee' },
        }));

      instance.post('/bc/bulletins/generer', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'bulletins.generate',
          verifierScope: true,
          exigeTitulariat: true,
          resultat: { action: 'bulletin-genere' },
        }));

      instance.post('/bc/proclamations/generer', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'proclamations.generate',
          verifierScope: true,
          exigeTitulariat: true,
          resultat: { action: 'proclamation-generee' },
        }));

      instance.get('/bc/bulletins/lire', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'bulletins.read',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_BULLETINS',
          resultat: { action: 'bulletins-lus' },
        }));

      instance.post('/bc/paiements/percevoir', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'paiements.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_CAISSE',
          resultat: { action: 'paiement-percu' },
        }));

      instance.get('/bc/paiements/lire', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'paiements.read',
          verifierScope: true,
          resultat: { action: 'paiements-lus' },
        }));

      instance.post('/bc/caisse/ouvrir', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'caisse.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_CAISSE',
          resultat: { action: 'caisse-ouverte' },
        }));

      instance.get('/bc/finances/lire', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'paiements.read',
          verifierScope: true,
          resultat: { action: 'finances-lues' },
        }));

      instance.post('/bc/referentiel/modifier', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'referentiel.write',
          verifierScope: true,
          resultat: { action: 'referentiel-modifie' },
        }));

      instance.get('/bc/referentiel/lire', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'referentiel.read',
          verifierScope: true,
          resultat: { action: 'referentiel-lu' },
        }));

      instance.post('/bc/scolarite/abandon', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'abandons.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_ABANDON',
          resultat: { action: 'abandon-declare' },
        }));

      instance.post('/bc/scolarite/transfert', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'transferts.write',
          verifierScope: true,
          codeRestriction: 'INTERDICTION_TRANSFERT',
          resultat: { action: 'transfert-effectue' },
        }));

      instance.get('/bc/scolarite/lire', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'eleves.read',
          verifierScope: true,
          resultat: { action: 'scolarite-lue' },
        }));

      instance.get('/bc/organisation/synthese', async (requete, reponse) =>
        this.executerRouteProtegee(requete, reponse, {
          permission: 'utilisateurs.read',
          verifierScope: true,
          resultat: { action: 'synthese-organisation' },
        }));

      instance.get('/bc/parent/enfants/:idEleve', async (requete, reponse) => {
        const utilisateurId = requete.context.utilisateurId;
        if (!utilisateurId) {
          return reponse.code(401).send({ success: false, message: 'AUTH_REQUIRED' });
        }

        await this.securityFacade.verifierPermission({
          idUtilisateur: utilisateurId,
          permissionDemandee: 'eleves.read',
        });

        const idEleve = String((requete.params as { idEleve?: string }).idEleve ?? '');
        const meta = this.metadonneesActeurs.get(utilisateurId);
        if (!meta?.elevesAutorises.includes(idEleve)) {
          return reponse.code(403).send({ success: false, message: 'ELEVE_REFUSED' });
        }

        return reponse.code(200).send({ action: 'enfant-lu', idEleve });
      });
    });

    return serveur;
  }

  public obtenirLoginUseCase(): LoginUseCase {
    return this.loginUseCase;
  }

  public creerAuthenticationPlugin() {
    return creerAuthenticationPlugin({
      jwtTokenAdapter: this.jwt,
      utilisateurAuthRepository: this.authRepositories.depotUtilisateurAuth,
      contexteActifAuthRepository: this.authRepositories.depotContexteActifAuth,
      sessionApplicationService: new SessionApplicationService(
        this.authRepositories.depotSessionUtilisateur,
        this.authRepositories.depotRefreshToken,
        this.sessionCache,
      ),
      environment: 'test',
    });
  }

  public creerSecurityPlugin() {
    return creerSecurityPlugin({
      roleRepository: this.securityRepositories.roleRepository,
      affectationUtilisateurRepository: this.securityRepositories.affectationRepository,
      affectationTitulariatRepository: this.securityRepositories.titulariatRepository,
      auditSecurityPort: null,
      responsabiliteClassePedagogiquePort: null,
    });
  }

  public obtenirLogoutUseCase(): LogoutUseCase {
    return this.logoutUseCase;
  }

  public obtenirRefreshUseCase(): RefreshTokenUseCase {
    return this.refreshTokenUseCase;
  }

  public obtenirRevocationGlobaleUseCase(): RevoquerToutesSessionsUtilisateurUseCase {
    return this.revoquerToutesSessionsUseCase;
  }

  public obtenirChangerEcoleActiveUseCase(): ChangerEcoleActiveUseCase {
    return this.changerEcoleActiveUseCase;
  }

  public obtenirChangerOrganisationActiveUseCase(): ChangerOrganisationActiveUseCase {
    return this.changerOrganisationActiveUseCase;
  }

  private async executerRouteProtegee(
    requete: FastifyRequest,
    reponse: FastifyReply,
    options: {
      permission: string;
      verifierScope: boolean;
      codeRestriction?: string;
      exigeTitulariat?: boolean;
      resultat: Record<string, unknown>;
    },
  ) {
    try {
      assert.ok(requete.context.utilisateurId, 'Utilisateur absent du contexte');
      const utilisateurId = requete.context.utilisateurId;

      const corps = (requete.body ?? {}) as { idClasse?: string; idAnneeScolaire?: string };
      const decision = await this.securityFacade.verifierAcces({
        idUtilisateur: utilisateurId,
        permissionDemandee: options.permission,
        idOrganisation: options.verifierScope ? requete.context.organisationActiveId : undefined,
        idEcole: options.verifierScope ? requete.context.ecoleActiveId : undefined,
        idClasse: options.exigeTitulariat ? corps.idClasse : undefined,
        idAnneeScolaire: options.exigeTitulariat ? corps.idAnneeScolaire : undefined,
        codeRestriction: options.codeRestriction,
      });
      if (!decision.autorise) {
        throw new Error('PERMISSION_REFUSED');
      }

      return reponse.code(200).send(options.resultat);
    } catch (error) {
      return reponse.code(403).send({
        success: false,
        message: error instanceof Error ? error.message : 'ACCESS_REFUSED',
      });
    }
  }

}
