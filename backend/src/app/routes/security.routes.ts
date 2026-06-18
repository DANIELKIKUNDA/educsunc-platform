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
import { obtenirMemoireSecurityStore } from '../../shared/security/infrastructure/persistence/postgres/repositories/_memoireSecurityStore';
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
  async () => obtenirMemoireSecurityStore().securityAccessLogs,
  async () => obtenirMemoireSecurityStore().securityPermissionDeniedLogs,
  async () => obtenirMemoireSecurityStore().securityAccessLogs,
);

function aPorteePlateforme(requete: FastifyRequest): boolean {
  return (requete.context?.scopes ?? []).some(
    (scope) => scope.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
  );
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

    serveur.get('/api/v1/security/roles', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.read'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => roleController.listerRoles());
    });

    serveur.post('/api/v1/security/roles', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => roleController.creer(requete.body), 201);
    });

    serveur.patch('/api/v1/security/roles/:codeRole/activate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.activer((requete.params as Record<string, string>).codeRole),
      );
    });

    serveur.patch('/api/v1/security/roles/:codeRole/deactivate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'roles.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.desactiver((requete.params as Record<string, string>).codeRole),
      );
    });

    serveur.get('/api/v1/security/roles/:codeRole/permissions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.read'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.listerPermissions((requete.params as Record<string, string>).codeRole),
      );
    });

    serveur.post('/api/v1/security/roles/:codeRole/permissions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.ajouterPermission((requete.params as Record<string, string>).codeRole, requete.body),
        201,
      );
    });

    serveur.delete('/api/v1/security/roles/:codeRole/permissions/:permission', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.retirerPermission(
          (requete.params as Record<string, string>).codeRole,
          (requete.params as Record<string, string>).permission,
        ),
      );
    });

    serveur.post('/api/v1/security/roles/:codeRole/restrictions', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.ajouterRestriction((requete.params as Record<string, string>).codeRole, requete.body),
        201,
      );
    });

    serveur.delete('/api/v1/security/roles/:codeRole/restrictions/:codeRestriction', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'permissions.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => roleController.retirerRestriction(
          (requete.params as Record<string, string>).codeRole,
          (requete.params as Record<string, string>).codeRestriction,
        ),
      );
    });

    serveur.post('/api/v1/security/affectations', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(reponse, () => affectationUtilisateurController.creer(requete.body), 201);
    });

    serveur.patch('/api/v1/security/affectations/:idAffectationUtilisateur/activate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.activer((requete.params as Record<string, string>).idAffectationUtilisateur),
      );
    });

    serveur.patch('/api/v1/security/affectations/:idAffectationUtilisateur/deactivate', async (requete, reponse) => {
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.desactiver((requete.params as Record<string, string>).idAffectationUtilisateur),
      );
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
      if (!(await verifierAccesRouteSecurity(requete, reponse, 'utilisateurs.write'))) {
        return;
      }
      await executerRouteSecurity(
        reponse,
        () => affectationUtilisateurController.retirerScope(
          (requete.params as Record<string, string>).idAffectationUtilisateur,
          (requete.params as Record<string, string>).typeScope,
          (requete.params as Record<string, string>).valeurScope,
        ),
      );
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
