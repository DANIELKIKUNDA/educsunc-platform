import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  ActiverAffectationUseCase,
  ActiverRoleUseCase,
  AjouterPermissionRoleUseCase,
  AjouterRestrictionRoleUseCase,
  AjouterScopeAffectationUseCase,
  AttribuerTitulariatUseCase,
  CreerAffectationUtilisateurUseCase,
  CreerRoleUseCase,
  DesactiverAffectationUseCase,
  DesactiverRoleUseCase,
  ListerAffectationsUtilisateurUseCase,
  ListerPermissionsRoleUseCase,
  ListerRolesUseCase,
  ListerScopesUtilisateurUseCase,
  RetirerPermissionRoleUseCase,
  RetirerRestrictionRoleUseCase,
  RetirerScopeAffectationUseCase,
  RetirerTitulariatUseCase,
  SagaAffectationUtilisateur,
  SagaAutorisation,
  SagaTitulariat,
  SecurityAffectationService,
  SecurityFacade,
  SecurityRoleService,
  VerifierAccesUseCase,
  VerifierPermissionUseCase,
  VerifierRestrictionUseCase,
  VerifierScopeUseCase,
  VerifierTitulariatUseCase,
} from '../../shared/security/application';
import {
  MoteurAutorisation,
  MoteurCapacitesEffectives,
  MoteurRestrictionsMetier,
  MoteurScope,
  MoteurTitulariat,
} from '../../shared/security/domain';
import {
  PermissionCacheService,
  PostgresAffectationTitulariatRepository,
  PostgresAffectationUtilisateurRepository,
  PostgresPermissionRepository,
  PostgresRoleRepository,
  SecurityAuditInfrastructureService,
  SecurityNotificationAdapter,
  SecurityTransactionManager,
  SecurityGovernancePostgresService,
  SecurityGovernanceError,
  ListerAffectationsUtilisateurSQL,
  ListerPermissionsRoleSQL,
  ListerRolesSQL,
  ListerScopesUtilisateurSQL,
  VerifierTitulariatClasseSQL,
} from '../../shared/security/infrastructure';
import {
  AffectationUtilisateurController,
  AutorisationController,
  RoleController,
  SecuriteAuditController,
  TitulariatController,
} from '../../shared/security/interfaces/http/controllers';
import { SecurityErrorPresenter } from '../../shared/security/interfaces/http/presenters';
import { ResponsabiliteClassePedagogiqueAdapter } from '../adapters/ResponsabiliteClassePedagogiqueAdapter';

type PluginRoutesSecurity = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

const roleRepository = new PostgresRoleRepository();
const permissionRepository = new PostgresPermissionRepository();
const affectationRepository = new PostgresAffectationUtilisateurRepository();
const titulariatRepository = new PostgresAffectationTitulariatRepository();
const permissionCache = new PermissionCacheService();
const auditSecurity = new SecurityAuditInfrastructureService();
const securityGovernance = new SecurityGovernancePostgresService();
const responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
const securityFacade = new SecurityFacade(
  roleRepository,
  affectationRepository,
  titulariatRepository,
  permissionCache,
  new MoteurAutorisation(),
  new MoteurScope(),
  new MoteurRestrictionsMetier(),
  new MoteurCapacitesEffectives(),
  auditSecurity,
  responsabiliteClassePedagogiqueAdapter,
);
const securityRoleService = new SecurityRoleService(
  roleRepository,
  permissionRepository,
  { maintenant: () => new Date() },
);
const securityAffectationService = new SecurityAffectationService(
  affectationRepository,
  roleRepository,
  titulariatRepository,
  new VerifierTitulariatClasseSQL(),
  new SecurityNotificationAdapter(),
  new MoteurTitulariat(),
  auditSecurity,
);
const securityTransactionManager = new SecurityTransactionManager();
const sagaAffectationUtilisateur = new SagaAffectationUtilisateur(
  securityTransactionManager,
  securityAffectationService,
);
const sagaTitulariat = new SagaTitulariat(
  securityTransactionManager,
  securityAffectationService,
);
const sagaAutorisation = new SagaAutorisation(securityFacade);

const roleController = new RoleController(
  new CreerRoleUseCase(securityRoleService),
  new ActiverRoleUseCase(securityRoleService),
  new DesactiverRoleUseCase(securityRoleService),
  new AjouterPermissionRoleUseCase(securityRoleService),
  new RetirerPermissionRoleUseCase(securityRoleService),
  new AjouterRestrictionRoleUseCase(securityRoleService),
  new RetirerRestrictionRoleUseCase(securityRoleService),
  new ListerRolesUseCase(new ListerRolesSQL()),
  new ListerPermissionsRoleUseCase(new ListerPermissionsRoleSQL()),
);
const affectationUtilisateurController = new AffectationUtilisateurController(
  new CreerAffectationUtilisateurUseCase(sagaAffectationUtilisateur),
  new ActiverAffectationUseCase(securityAffectationService),
  new DesactiverAffectationUseCase(sagaAffectationUtilisateur),
  new AjouterScopeAffectationUseCase(sagaAffectationUtilisateur),
  new RetirerScopeAffectationUseCase(securityAffectationService),
  new ListerAffectationsUtilisateurUseCase(new ListerAffectationsUtilisateurSQL()),
  new ListerScopesUtilisateurUseCase(new ListerScopesUtilisateurSQL()),
);
const titulariatController = new TitulariatController(
  new AttribuerTitulariatUseCase(sagaTitulariat),
  new RetirerTitulariatUseCase(sagaTitulariat),
  new VerifierTitulariatUseCase(securityAffectationService),
);
const autorisationController = new AutorisationController(
  new VerifierPermissionUseCase(sagaAutorisation),
  new VerifierScopeUseCase(sagaAutorisation),
  new VerifierRestrictionUseCase(securityFacade),
  new VerifierAccesUseCase(sagaAutorisation),
);
const securiteAuditController = new SecuriteAuditController(
  async () => auditSecurity.lister(),
  async () => auditSecurity.lister({ succes: false }),
  async () => auditSecurity.lister({ succes: true }),
);

function aPorteePlateforme(requete: FastifyRequest): boolean {
  return (requete.context?.scopes ?? []).some(
    (scope) => scope.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
  );
}

function aPorteeOrganisation(requete: FastifyRequest, organisationId: string): boolean {
  return aPorteePlateforme(requete) || (requete.context?.scopes ?? []).some(
    (scope) => scope.obtenirTypeScope().obtenirValeur() === 'ORGANISATION'
      && scope.obtenirValeurScope() === organisationId,
  );
}

async function verifierAccesOrganisationSecurity(
  requete: FastifyRequest,
  reponse: FastifyReply,
  permission: string,
  organisationId: string,
  autoriserPlateforme = true,
): Promise<boolean> {
  if (!requete.context?.utilisateurId) {
    reponse.code(401).send({ success: false, error: { code: 'SECURITY_AUTH_REQUIRED', message: 'Authentification requise.' } });
    return false;
  }
  const porteeValide = autoriserPlateforme
    ? aPorteeOrganisation(requete, organisationId)
    : !aPorteePlateforme(requete) && aPorteeOrganisation(requete, organisationId);
  if (!(requete.context.permissions ?? []).includes(permission) || !porteeValide) {
    reponse.code(403).send({ success: false, error: { code: 'SECURITY_PERMISSION_DENIED', message: "Vous n'êtes pas autorisé à effectuer cette action dans cette organisation." } });
    return false;
  }
  return true;
}

function lireObjet(source: unknown): Record<string, unknown> {
  return source && typeof source === 'object' && !Array.isArray(source)
    ? source as Record<string, unknown>
    : {};
}

function lireTexte(source: Record<string, unknown>, cle: string): string | undefined {
  const valeur = source[cle];
  return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : undefined;
}

function contexteMutation(requete: FastifyRequest, corps: Record<string, unknown>) {
  return {
    auteurId: requete.context.utilisateurId!,
    traceId: requete.context.correlationId ?? requete.context.requestId,
    motif: lireTexte(corps, 'motif'),
  };
}

async function executerGouvernance(
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  statutSucces = 200,
): Promise<void> {
  try {
    const data = await operation();
    reponse.code(statutSucces).send({ success: true, data });
  } catch (erreur) {
    if (erreur instanceof SecurityGovernanceError) {
      reponse.code(erreur.statutHttp).send({ success: false, error: { code: erreur.code, message: erreur.message } });
      return;
    }
    const presentee = SecurityErrorPresenter.presenterErreur(erreur);
    reponse.code(presentee.statutHttp).send(presentee.corps);
  }
}

async function verifierAccesRouteSecurity(
  requete: FastifyRequest,
  reponse: FastifyReply,
  permission: string,
): Promise<boolean> {
  if (!requete.context?.utilisateurId) {
    reponse.code(401).send({
      success: false,
      error: {
        code: 'SECURITY_AUTH_REQUIRED',
        message: 'Authentification requise.',
      },
    });
    return false;
  }

  if (!aPorteePlateforme(requete)) {
    reponse.code(403).send({
      success: false,
      error: {
        code: 'SECURITY_PLATFORM_SCOPE_REQUIRED',
        message: 'Cette API de gouvernance security est reservee au niveau plateforme.',
      },
    });
    return false;
  }

  if (!(requete.context.permissions ?? []).includes(permission)) {
    reponse.code(403).send({
      success: false,
      error: {
        code: 'SECURITY_PERMISSION_DENIED',
        message: `Permission requise: ${permission}`,
      },
    });
    return false;
  }

  return true;
}

async function executerRouteSecurity(
  reponse: FastifyReply,
  operation: () => Promise<{ donnee: unknown }>,
  statutSucces = 200,
): Promise<void> {
  try {
    const resultat = await operation();
    reponse.code(statutSucces).send(resultat.donnee);
  } catch (erreur) {
    const presentee = SecurityErrorPresenter.presenterErreur(erreur);
    reponse.code(presentee.statutHttp).send(presentee.corps);
  }
}

export const routeSecurity: PluginRoutesSecurity = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onClose', async () => {
      await responsabiliteClassePedagogiqueAdapter.fermer();
    });

    serveur.get('/api/v1/security/overview', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.center.read'))) return;
      await executerGouvernance(reponse, () => securityGovernance.obtenirVueEnsemble());
    });

    serveur.get('/api/v1/security/accounts', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.read'))) return;
      const query = lireObjet(requete.query);
      const niveau = lireTexte(query, 'niveau');
      await executerGouvernance(reponse, () => securityGovernance.listerComptes({
        niveau: ['PLATEFORME','ORGANISATION','ECOLE'].includes(niveau ?? '') ? niveau as 'PLATEFORME'|'ORGANISATION'|'ECOLE' : undefined,
        organisationId: lireTexte(query, 'organisationId'),
        ecoleId: lireTexte(query, 'ecoleId'),
        recherche: lireTexte(query, 'recherche'),
        etat: lireTexte(query, 'etat'),
        limite: Number(query.limite) || undefined,
        curseur: lireTexte(query, 'curseur'),
      }));
    });

    serveur.post('/api/v1/security/accounts/platform', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.write'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.creerCompteAvecAffectation({
        nomComplet: lireTexte(corps,'nomComplet') ?? '', email: lireTexte(corps,'email') ?? '',
        telephone: lireTexte(corps,'telephone'), motDePasseInitial: lireTexte(corps,'motDePasseInitial') ?? '',
        codeRole: lireTexte(corps,'codeRole') ?? '', niveau:'PLATEFORME', motif:lireTexte(corps,'motif'),
      }, contexteMutation(requete, corps)), 201);
    });

    serveur.get('/api/v1/security/accounts/:idUtilisateur', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.read'))) return;
      await executerGouvernance(reponse, () => securityGovernance.obtenirCompte((requete.params as Record<string,string>).idUtilisateur));
    });

    for (const action of ['suspend','reactivate','deactivate'] as const) {
      serveur.patch(`/api/v1/security/accounts/:idUtilisateur/${action}`, async (requete, reponse) => {
        if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.lifecycle'))) return;
        const corps = lireObjet(requete.body);
        const etat = action === 'suspend' ? 'SUSPENDED' : action === 'deactivate' ? 'DISABLED' : 'ACTIVE';
        await executerGouvernance(reponse, () => securityGovernance.changerEtatCompte(
          (requete.params as Record<string,string>).idUtilisateur, etat, contexteMutation(requete, corps),
        ));
      });
    }

    serveur.patch('/api/v1/security/accounts/:idUtilisateur/unlock', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.unlock'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.deverrouillerCompte(
        (requete.params as Record<string,string>).idUtilisateur, contexteMutation(requete, corps),
      ));
    });

    serveur.patch('/api/v1/security/accounts/:idUtilisateur/reset-password', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.accounts.lifecycle'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.reinitialiserMotDePasse(
        (requete.params as Record<string,string>).idUtilisateur,
        lireTexte(corps, 'nouveauMotDePasse') ?? '',
        contexteMutation(requete, corps),
      ));
    });

    serveur.get('/api/v1/security/administrators/organizations', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.admin.organizations.read'))) return;
      const query = lireObjet(requete.query);
      await executerGouvernance(reponse, () => securityGovernance.listerAdministrateurs('ORGANISATION', {
        organisationId:lireTexte(query,'organisationId'),
      }));
    });

    serveur.get('/api/v1/security/administration-scopes', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.admin.organizations.read'))) return;
      await executerGouvernance(reponse, () => securityGovernance.listerPerimetresAdministratifs());
    });

    serveur.get('/api/v1/security/organizations/:organisationId/administrators', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.admin.organizations.read'))) return;
      const { organisationId } = requete.params as Record<string,string>;
      await executerGouvernance(reponse, () => securityGovernance.listerAdministrateurs('ORGANISATION', { organisationId }));
    });

    serveur.post('/api/v1/security/organizations/:organisationId/administrators', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.admin.organizations.write'))) return;
      const { organisationId } = requete.params as Record<string,string>;
      const corps = lireObjet(requete.body);
      const idUtilisateur = lireTexte(corps,'idUtilisateur');
      const operation = idUtilisateur
        ? () => securityGovernance.affecterCompteExistant({
          idUtilisateur,codeRole:'ADMIN_SYSTEME_ORGANISATION',niveau:'ORGANISATION',organisationId,
          motif:lireTexte(corps,'motif'),
        }, contexteMutation(requete, corps))
        : () => securityGovernance.creerCompteAvecAffectation({
          nomComplet:lireTexte(corps,'nomComplet') ?? '',email:lireTexte(corps,'email') ?? '',
          telephone:lireTexte(corps,'telephone'),motDePasseInitial:lireTexte(corps,'motDePasseInitial') ?? '',
          codeRole:'ADMIN_SYSTEME_ORGANISATION',niveau:'ORGANISATION',organisationId,
          motif:lireTexte(corps,'motif'),
        }, contexteMutation(requete, corps));
      await executerGouvernance(reponse, operation, 201);
    });

    serveur.post('/api/v1/security/organizations/:organisationId/administrators/:idAffectation/replace', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.admin.organizations.write'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse,() => securityGovernance.remplacerAdministrateur(
        (requete.params as Record<string,string>).idAffectation,
        { idUtilisateur:lireTexte(corps,'idUtilisateur'),nomComplet:lireTexte(corps,'nomComplet'),
          email:lireTexte(corps,'email'),telephone:lireTexte(corps,'telephone'),
          motDePasseInitial:lireTexte(corps,'motDePasseInitial') },
        contexteMutation(requete,corps),
        { organisationId:(requete.params as Record<string,string>).organisationId },
      ));
    });

    serveur.get('/api/v1/security/administrators/schools', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.admin.schools.read'))) return;
      const query = lireObjet(requete.query);
      await executerGouvernance(reponse, () => securityGovernance.listerAdministrateurs('ECOLE', {
        organisationId:lireTexte(query,'organisationId'),ecoleId:lireTexte(query,'ecoleId'),
      }));
    });

    serveur.post('/api/v1/security/organizations/:organisationId/schools/:ecoleId/administrators', async (requete, reponse) => {
      const { organisationId,ecoleId } = requete.params as Record<string,string>;
      if (!(await verifierAccesOrganisationSecurity(requete,reponse,'security.admin.schools.write',organisationId,false))) return;
      const corps = lireObjet(requete.body);
      const idUtilisateur = lireTexte(corps,'idUtilisateur');
      const operation = idUtilisateur
        ? () => securityGovernance.affecterCompteExistant({ idUtilisateur,codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId,ecoleId,motif:lireTexte(corps,'motif') },contexteMutation(requete,corps))
        : () => securityGovernance.creerCompteAvecAffectation({
          nomComplet:lireTexte(corps,'nomComplet') ?? '',email:lireTexte(corps,'email') ?? '',
          telephone:lireTexte(corps,'telephone'),motDePasseInitial:lireTexte(corps,'motDePasseInitial') ?? '',
          codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId,ecoleId,motif:lireTexte(corps,'motif'),
        },contexteMutation(requete,corps));
      await executerGouvernance(reponse,operation,201);
    });

    serveur.post('/api/v1/security/organizations/:organisationId/schools/:ecoleId/administrators/:idAffectation/replace', async (requete, reponse) => {
      const { organisationId } = requete.params as Record<string,string>;
      if (!(await verifierAccesOrganisationSecurity(requete,reponse,'security.admin.schools.write',organisationId,false))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse,() => securityGovernance.remplacerAdministrateur(
        (requete.params as Record<string,string>).idAffectation,
        { idUtilisateur:lireTexte(corps,'idUtilisateur'),nomComplet:lireTexte(corps,'nomComplet'),
          email:lireTexte(corps,'email'),telephone:lireTexte(corps,'telephone'),
          motDePasseInitial:lireTexte(corps,'motDePasseInitial') },
        contexteMutation(requete,corps),
        { organisationId,ecoleId:(requete.params as Record<string,string>).ecoleId },
      ));
    });

    serveur.post('/api/v1/security/emergency/organizations/:organisationId/schools/:ecoleId/administrators', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.admin.schools.emergency.write'))) return;
      const { organisationId,ecoleId } = requete.params as Record<string,string>;
      const corps = lireObjet(requete.body);
      if (!lireTexte(corps,'motif')) {
        reponse.code(400).send({success:false,error:{code:'SECURITY_REASON_REQUIRED',message:"Le motif de l'intervention exceptionnelle est obligatoire."}});
        return;
      }
      const idUtilisateur = lireTexte(corps,'idUtilisateur');
      const operation = idUtilisateur
        ? () => securityGovernance.affecterCompteExistant({idUtilisateur,codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId,ecoleId,motif:lireTexte(corps,'motif')},contexteMutation(requete,corps))
        : () => securityGovernance.creerCompteAvecAffectation({
          nomComplet:lireTexte(corps,'nomComplet') ?? '',email:lireTexte(corps,'email') ?? '',telephone:lireTexte(corps,'telephone'),
          motDePasseInitial:lireTexte(corps,'motDePasseInitial') ?? '',codeRole:'ADMIN_SYSTEME_ECOLE',niveau:'ECOLE',organisationId,ecoleId,motif:lireTexte(corps,'motif'),
        },contexteMutation(requete,corps));
      await executerGouvernance(reponse,operation,201);
    });

    serveur.post('/api/v1/security/emergency/organizations/:organisationId/schools/:ecoleId/administrators/:idAffectation/replace', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.admin.schools.emergency.write'))) return;
      const corps = lireObjet(requete.body);
      if (!lireTexte(corps,'motif')) {
        reponse.code(400).send({success:false,error:{code:'SECURITY_REASON_REQUIRED',message:"Le motif de l'intervention exceptionnelle est obligatoire."}});
        return;
      }
      await executerGouvernance(reponse,() => securityGovernance.remplacerAdministrateur(
        (requete.params as Record<string,string>).idAffectation,
        { idUtilisateur:lireTexte(corps,'idUtilisateur'),nomComplet:lireTexte(corps,'nomComplet'),
          email:lireTexte(corps,'email'),telephone:lireTexte(corps,'telephone'),
          motDePasseInitial:lireTexte(corps,'motDePasseInitial') },
        contexteMutation(requete,corps),
        { organisationId:(requete.params as Record<string,string>).organisationId,
          ecoleId:(requete.params as Record<string,string>).ecoleId },
      ));
    });

    serveur.get('/api/v1/security/assignments', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.assignments.read'))) return;
      const query = lireObjet(requete.query);
      await executerGouvernance(reponse,() => securityGovernance.listerAffectations(lireTexte(query,'utilisateurId')));
    });

    serveur.get('/api/v1/security/sessions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.sessions.read'))) return;
      const query = lireObjet(requete.query);
      await executerGouvernance(reponse,() => securityGovernance.listerSessions({
        utilisateurId:lireTexte(query,'utilisateurId'),organisationId:lireTexte(query,'organisationId'),ecoleId:lireTexte(query,'ecoleId'),
      }));
    });

    serveur.delete('/api/v1/security/sessions/:idSession', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.sessions.revoke'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse,() => securityGovernance.revoquerSession((requete.params as Record<string,string>).idSession,contexteMutation(requete,corps)),204);
    });

    serveur.delete('/api/v1/security/accounts/:idUtilisateur/sessions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.sessions.revoke'))) return;
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse,() => securityGovernance.revoquerToutesSessions((requete.params as Record<string,string>).idUtilisateur,contexteMutation(requete,corps)),204);
    });

    serveur.get('/api/v1/security/login-attempts', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete,reponse,'security.attempts.read'))) return;
      const query = lireObjet(requete.query);
      const resultat = lireTexte(query,'resultat');
      await executerGouvernance(reponse,() => securityGovernance.listerTentatives({
        recherche:lireTexte(query,'recherche'),reussie:resultat === 'SUCCES' ? true : resultat === 'ECHEC' ? false : undefined,
        limite:Number(query.limite) || undefined,
      }));
    });

    serveur.get('/api/v1/security/roles', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.read'))) {
        return;
      }
      await executerGouvernance(reponse, () => securityGovernance.listerRoles());
    });

    serveur.get('/api/v1/security/permission-catalog', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) return;
      await executerGouvernance(reponse, () => securityGovernance.listerCataloguePermissions());
    });

    serveur.get('/api/v1/security/roles/:codeRole', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.read'))) return;
      await executerGouvernance(reponse, () => securityGovernance.obtenirRole(
        (requete.params as Record<string,string>).codeRole,
      ));
    });

    serveur.post('/api/v1/security/roles', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.creerRolePersonnalise({
        codeRole:lireTexte(corps,'codeRole') ?? '',nomRole:lireTexte(corps,'nomRole') ?? '',
        description:lireTexte(corps,'description'),niveauAcces:lireTexte(corps,'niveauAcces') ?? '',
        permissions:Array.isArray(corps.permissions) ? corps.permissions.filter((item): item is string => typeof item === 'string') : [],
      },contexteMutation(requete,corps)),201);
    });

    serveur.patch('/api/v1/security/roles/:codeRole/activate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.changerEtatRole(
        (requete.params as Record<string,string>).codeRole,true,contexteMutation(requete,corps),
      ));
    });

    serveur.patch('/api/v1/security/roles/:codeRole/deactivate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.changerEtatRole(
        (requete.params as Record<string,string>).codeRole,false,contexteMutation(requete,corps),
      ));
    });

    serveur.get('/api/v1/security/roles/:codeRole/permissions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerGouvernance(reponse, async () => (
        await securityGovernance.obtenirRole((requete.params as Record<string,string>).codeRole)
      ).permissions);
    });

    serveur.get('/api/v1/security/roles/:codeRole/restrictions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) return;
      await executerGouvernance(reponse, async () => (
        await securityGovernance.obtenirRole((requete.params as Record<string,string>).codeRole)
      ).restrictions);
    });

    serveur.post('/api/v1/security/roles/:codeRole/permissions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.modifierCapaciteRole(
        (requete.params as Record<string,string>).codeRole,'PERMISSION',lireTexte(corps,'permission') ?? '',true,
        contexteMutation(requete,corps),
      ),201);
    });

    serveur.delete('/api/v1/security/roles/:codeRole/permissions/:permission', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.modifierCapaciteRole(
        (requete.params as Record<string,string>).codeRole,'PERMISSION',
        (requete.params as Record<string,string>).permission,false,contexteMutation(requete,corps),
      ));
    });

    serveur.post('/api/v1/security/roles/:codeRole/restrictions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.modifierCapaciteRole(
        (requete.params as Record<string,string>).codeRole,'RESTRICTION',lireTexte(corps,'codeRestriction') ?? '',true,
        contexteMutation(requete,corps),
      ),201);
    });

    serveur.delete('/api/v1/security/roles/:codeRole/restrictions/:codeRestriction', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.modifierCapaciteRole(
        (requete.params as Record<string,string>).codeRole,'RESTRICTION',
        (requete.params as Record<string,string>).codeRestriction,false,contexteMutation(requete,corps),
      ));
    });

    serveur.post('/api/v1/security/affectations', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.assignments.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.creerAffectationGouvernance({
        idUtilisateur: lireTexte(corps,'idUtilisateur') ?? '',
        codeRole: lireTexte(corps,'codeRole') ?? '',
        niveau: (lireTexte(corps,'niveau') ?? '') as 'PLATEFORME'|'ORGANISATION'|'ECOLE',
        organisationId: lireTexte(corps,'organisationId'),
        ecoleId: lireTexte(corps,'ecoleId'),
        motif: lireTexte(corps,'motif') ?? '',
      }, contexteMutation(requete,corps)), 201);
    });

    serveur.patch('/api/v1/security/affectations/:idAffectationUtilisateur/activate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.assignments.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.activerAffectation(
        (requete.params as Record<string, string>).idAffectationUtilisateur,
        contexteMutation(requete, corps),
      ), 204);
    });

    serveur.patch('/api/v1/security/affectations/:idAffectationUtilisateur/deactivate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.assignments.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.desactiverAffectation(
        (requete.params as Record<string, string>).idAffectationUtilisateur,
        contexteMutation(requete, corps),
      ), 204);
    });

    serveur.post('/api/v1/security/affectations/:idAffectationUtilisateur/scopes', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.ajouterScope((requete.params as Record<string, string>).idAffectationUtilisateur, requete.body),
        201,
      );
    });

    serveur.delete('/api/v1/security/affectations/:idAffectationUtilisateur/scopes/:typeScope/:valeurScope', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'security.assignments.write'))) {
        return;
      }
      const corps = lireObjet(requete.body);
      await executerGouvernance(reponse, () => securityGovernance.retirerScope(
        (requete.params as Record<string, string>).idAffectationUtilisateur,
        (requete.params as Record<string, string>).typeScope,
        (requete.params as Record<string, string>).valeurScope,
        contexteMutation(requete, corps),
      ), 204);
    });

    serveur.get('/api/v1/security/affectations/utilisateur/:idUtilisateur', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.read'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.listerAffectations((requete.params as Record<string, string>).idUtilisateur),
      );
    });

    serveur.get('/api/v1/security/affectations/utilisateur/:idUtilisateur/scopes', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.read'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.listerScopes((requete.params as Record<string, string>).idUtilisateur),
      );
    });

    serveur.post('/api/v1/security/titulariats', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => titulariatController.attribuer(requete.body), 201);
    });

    serveur.delete('/api/v1/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => titulariatController.retirer(
          (requete.params as Record<string, string>).idClasse,
          (requete.params as Record<string, string>).idAnneeScolaire,
        ),
      );
    });

    serveur.get('/api/v1/security/titulariats/classe/:idClasse/annee/:idAnneeScolaire', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.read'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => titulariatController.verifier(
          (requete.params as Record<string, string>).idClasse,
          (requete.params as Record<string, string>).idAnneeScolaire,
        ),
      );
    });

    serveur.post('/api/v1/security/permissions/check', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => autorisationController.verifierPermission(requete.body));
    });

    serveur.post('/api/v1/security/scopes/check', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => autorisationController.verifierScope(requete.body));
    });

    serveur.post('/api/v1/security/restrictions/check', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => autorisationController.verifierRestriction(requete.body));
    });

    serveur.post('/api/v1/security/access/check', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => autorisationController.verifierAcces(requete.body));
    });

    serveur.get('/api/v1/security/audit/logs', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'audit.security.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => securiteAuditController.listerLogs());
    });

    serveur.get('/api/v1/security/audit/refus', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'audit.security.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => securiteAuditController.listerRefus());
    });

    serveur.get('/api/v1/security/audit/access', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'audit.security.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => securiteAuditController.listerAcces());
    });

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-security',
          prefixe: routeSecurity.prefixe,
        },
      },
      'Routes Security enregistrees.',
    );
  },
  {
    nom: 'security',
    prefixe: '/api/v1',
  },
);
