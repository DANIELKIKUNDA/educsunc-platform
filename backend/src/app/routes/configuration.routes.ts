import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  CompareSnapshotsConfigurationUseCase,
  ControleurConfigurationHttp,
  ControleurPropagationConfigurationHttp,
  ControleurReloadRuntimeConfigurationHttp,
  ControleurSnapshotsConfigurationHttp,
  ControleurValidationConfigurationHttp,
  CreateConfigurationUseCase,
  CreateSnapshotConfigurationUseCase,
  DeleteConfigurationUseCase,
  FacadeInfrastructureConfiguration,
  type EffectiveConfigurationDto,
  GetConfigurationUseCase,
  GetEffectiveConfigurationUseCase,
  LockConfigurationUseCase,
  type NiveauConfiguration,
  type PortAuditConfiguration,
  type PorteeConfigurationProps,
  PolitiqueClassificationConfiguration,
  type ConfigurationDto,
  type ConfigurationSnapshotDto,
  OverrideConfigurationUseCase,
  ServiceApplicationConfigurationEffective,
  ServiceApplicationPropagationConfiguration,
  type TypeModuleConfiguration,
  TYPES_MODULE_CONFIGURATION,
  type ValeurConfiguration,
  PropagateConfigurationUseCase,
  ReloadRuntimeConfigurationUseCase,
  RepositoryConfigurationMemoire,
  RepositoryConfigurationSnapshotMemoire,
  type DependancesRoutesConfiguration,
  type EffectiveConfigurationReadModel,
  type ConfigurationReadModel,
  type ConfigurationSnapshotReadModel,
  UnlockConfigurationUseCase,
  UpdateConfigurationUseCase,
  ValidateConfigurationUseCase,
  creerRoutesConfiguration,
  creerRoutesPropagationConfiguration,
  creerRoutesReloadConfiguration,
  creerRoutesSnapshotsConfiguration,
  creerRoutesValidationConfiguration,
} from '../../shared/configuration';
import type { PortSuppressionConfiguration } from '../../shared/configuration/application/ports';
import { ConfigurationSnapshotMapper } from '../../shared/configuration/application/mappers/ConfigurationSnapshotMapper';
import { ConfigurationApplicationMapper } from '../../shared/configuration/application/mappers/ConfigurationApplicationMapper';
import { ConfigurationId, ConfigurationKey, ConfigurationScope, ConfigurationValue, type Configuration } from '../../shared/configuration/domain';

type PluginRoutesConfiguration = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

type PolitiqueScopeConfiguration =
  | 'SYSTEM'
  | 'CONFIGURATION_SCOPE_BODY'
  | 'CONFIGURATION_SCOPE_EXISTING'
  | 'CONFIGURATION_SCOPE_QUERY';

const CLE_MODULES_ALLOWED = 'modules.allowed';
const CLE_MODULES_ENABLED = 'modules.enabled';
const MODULES_CONFIGURATION = [...TYPES_MODULE_CONFIGURATION];
const ROLES_PLATEFORME_CONFIGURATION = new Set([
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
  'SUPPORT_SYSTEME',
]);
const ROLES_ORGANISATION_CONFIGURATION = new Set([
  'PROMOTEUR_ORGANISATION',
  'ADMIN_SYSTEME_ORGANISATION',
  'GESTIONNAIRE_ORGANISATION',
]);
const ROLES_ECOLE_CONFIGURATION = new Set([
  'ADMINISTRATEUR_ECOLE',
  'ADMIN_SYSTEME_ECOLE',
]);

const infrastructureConfiguration = new FacadeInfrastructureConfiguration();
const registreConfiguration = infrastructureConfiguration.composants();
const politiqueClassificationConfiguration = new PolitiqueClassificationConfiguration();

class AuditConfigurationMemoirePort implements PortAuditConfiguration {
  public readonly journal: Array<{ configurationId: string; evenements: readonly object[] }> = [];

  public async enregistrerEvenementsConfiguration(
    configurationId: string,
    evenements: readonly object[],
  ): Promise<void> {
    this.journal.push({ configurationId, evenements });
  }
}

class SuppressionConfigurationMemoirePort implements PortSuppressionConfiguration {
  constructor(private readonly repository: RepositoryConfigurationMemoire) {}

  public async supprimer(identifiant: ConfigurationId): Promise<void> {
    await this.repository.supprimer(identifiant);
  }
}

class ConfigurationReadModelMemoire implements ConfigurationReadModel {
  private readonly mapper = new ConfigurationApplicationMapper();

  constructor(private readonly repository: RepositoryConfigurationMemoire) {}

  public async trouverParId(configurationId: string): Promise<ConfigurationDto | null> {
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(configurationId));
    return configuration ? this.mapper.versDto(configuration) : null;
  }

  public listerConfigurations(): readonly Configuration[] {
    return this.repository
      .stockageMemoire()
      .lister()
      .map((enregistrement) => enregistrement.configuration);
  }
}

class EffectiveConfigurationReadModelMemoire implements EffectiveConfigurationReadModel {
  private readonly service = new ServiceApplicationConfigurationEffective();

  constructor(private readonly readModel: ConfigurationReadModelMemoire) {}

  public async trouver(
    scope: PorteeConfigurationProps,
    keyPrefix?: string,
  ): Promise<EffectiveConfigurationDto | null> {
    const configurations = this.readModel.listerConfigurations();
    const entrees = configurations.flatMap((configuration) => {
      const details = configuration.details();
      const verrouille = details.lock !== null;
      const cle = details.key;
      if (keyPrefix && !cle.startsWith(keyPrefix)) {
        return [];
      }

      const base = {
        key: ConfigurationKey.creer(cle),
        scope: ConfigurationScope.creer(details.scope),
        value: ConfigurationValue.creer(details.valeur),
        verrouille,
      };
      const overrides = details.overrides
        .filter(() => !keyPrefix || cle.startsWith(keyPrefix))
        .map((entreeOverride) => ({
          key: ConfigurationKey.creer(cle),
          scope: ConfigurationScope.creer(entreeOverride.scope.valeur()),
          value: ConfigurationValue.creer(entreeOverride.value.valeur()),
          verrouille,
        }));

      return [base, ...overrides];
    });

    return this.service.calculer(scope, entrees);
  }
}

class ConfigurationSnapshotReadModelMemoire implements ConfigurationSnapshotReadModel {
  private readonly mapper = new ConfigurationSnapshotMapper();

  constructor(private readonly repository: RepositoryConfigurationSnapshotMemoire) {}

  public async trouverParId(
    _configurationId: string,
    snapshotId: string,
  ): Promise<ConfigurationSnapshotDto | null> {
    const snapshots = this.repository
      .stockageMemoire()
      .listerParConfiguration(ConfigurationId.creer(snapshotId));
    const snapshot = snapshots.find(
      (enregistrement) => enregistrement.snapshot.details().identifiantSnapshot === snapshotId,
    )?.snapshot;
    return snapshot ? this.mapper.versDto(snapshot) : null;
  }

  public async listerParConfiguration(configurationId: string): Promise<readonly ConfigurationSnapshotDto[]> {
    return this.repository
      .stockageMemoire()
      .listerParConfiguration(ConfigurationId.creer(configurationId))
      .map((enregistrement) => this.mapper.versDto(enregistrement.snapshot));
  }
}

interface ResolutionModulesEcole {
  readonly organisationId: string;
  readonly ecoleId: string;
  readonly modulesAutorisesOrganisation: readonly TypeModuleConfiguration[];
  readonly modulesActivesEcole: readonly TypeModuleConfiguration[];
  readonly modulesEffectifs: readonly TypeModuleConfiguration[];
}

class ServiceActivationModulesConfiguration {
  constructor(
    private readonly readModel: ConfigurationReadModelMemoire,
    private readonly createUseCase: CreateConfigurationUseCase,
    private readonly updateUseCase: UpdateConfigurationUseCase,
  ) {}

  public async configurerModulesOrganisation(params: {
    organisationId: string;
    modules: readonly string[];
    actorId?: string;
    requestId?: string;
    correlationId?: string;
  }): Promise<{ configurationId: string; modules: readonly TypeModuleConfiguration[] }> {
    const modules = this.normaliserModules(params.modules);
    const scope = { niveau: 'ORGANIZATION' as const, organisationId: params.organisationId };
    const configuration = this.trouverParCleEtScope(CLE_MODULES_ALLOWED, scope);

    if (configuration) {
      await this.updateUseCase.executer({
        configurationId: configuration.details().identifiant,
        value: modules,
        actorId: params.actorId,
        requestId: params.requestId,
        correlationId: params.correlationId,
        metadata: { type: 'ORGANIZATION_MODULES_ALLOWED' },
      });
      return { configurationId: configuration.details().identifiant, modules };
    }

    const creee = await this.createUseCase.executer({
      configurationId: randomUUID(),
      key: CLE_MODULES_ALLOWED,
      value: modules,
      scope,
      actorId: params.actorId,
      requestId: params.requestId,
      correlationId: params.correlationId,
      gouvernance: {
        proprietaireNiveau: 'ORGANIZATION',
        heritable: true,
        overridable: true,
        visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        auditRequis: true,
        restartRequis: false,
      },
    });
    return { configurationId: creee.identifiant, modules };
  }

  public async configurerModulesEcole(params: {
    organisationId: string;
    ecoleId: string;
    modules: readonly string[];
    actorId?: string;
    requestId?: string;
    correlationId?: string;
  }): Promise<{ configurationId: string; modules: readonly TypeModuleConfiguration[] }> {
    const modules = this.normaliserModules(params.modules);
    const scope = {
      niveau: 'SCHOOL' as const,
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
    };
    const configuration = this.trouverParCleEtScope(CLE_MODULES_ENABLED, scope);

    if (configuration) {
      await this.updateUseCase.executer({
        configurationId: configuration.details().identifiant,
        value: modules,
        actorId: params.actorId,
        requestId: params.requestId,
        correlationId: params.correlationId,
        metadata: { type: 'SCHOOL_MODULES_ENABLED' },
      });
      return { configurationId: configuration.details().identifiant, modules };
    }

    const creee = await this.createUseCase.executer({
      configurationId: randomUUID(),
      key: CLE_MODULES_ENABLED,
      value: modules,
      scope,
      actorId: params.actorId,
      requestId: params.requestId,
      correlationId: params.correlationId,
      gouvernance: {
        proprietaireNiveau: 'SCHOOL',
        heritable: true,
        overridable: false,
        visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
        auditRequis: true,
        restartRequis: false,
      },
    });
    return { configurationId: creee.identifiant, modules };
  }

  public async resoudreModulesEffectifs(params: {
    organisationId: string;
    ecoleId: string;
  }): Promise<ResolutionModulesEcole> {
    const allowedConfig = this.trouverParCleEtScope(CLE_MODULES_ALLOWED, {
      niveau: 'ORGANIZATION',
      organisationId: params.organisationId,
    });
    const enabledConfig = this.trouverParCleEtScope(CLE_MODULES_ENABLED, {
      niveau: 'SCHOOL',
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
    });

    const modulesAutorisesOrganisation = this.extraireModules(allowedConfig?.details().valeur);
    const modulesActivesEcole = this.extraireModules(enabledConfig?.details().valeur);
    const modulesEffectifs = modulesActivesEcole.filter((module) =>
      modulesAutorisesOrganisation.includes(module),
    );

    return {
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
      modulesAutorisesOrganisation,
      modulesActivesEcole,
      modulesEffectifs,
    };
  }

  public async moduleActif(params: {
    organisationId?: string;
    ecoleId?: string;
    module: TypeModuleConfiguration;
  }): Promise<boolean> {
    if (!params.organisationId || !params.ecoleId) {
      return true;
    }

    const resolution = await this.resoudreModulesEffectifs({
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
    });
    return resolution.modulesEffectifs.includes(params.module);
  }

  private extraireModules(value: ValeurConfiguration | undefined): readonly TypeModuleConfiguration[] {
    if (!Array.isArray(value)) {
      return MODULES_CONFIGURATION;
    }
    return this.normaliserModules(value as readonly string[]);
  }

  private normaliserModules(modules: readonly string[]): readonly TypeModuleConfiguration[] {
    return [...new Set(modules)]
      .filter((module): module is TypeModuleConfiguration =>
        MODULES_CONFIGURATION.includes(module as TypeModuleConfiguration),
      );
  }

  private trouverParCleEtScope(
    key: string,
    scope: {
      niveau: NiveauConfiguration;
      organisationId?: string;
      ecoleId?: string;
      utilisateurId?: string;
    },
  ): Configuration | null {
    return this.readModel
      .listerConfigurations()
      .find((configuration) => {
        const details = configuration.details();
        return (
          details.key === key
          && details.scope.niveau === scope.niveau
          && details.scope.organisationId === scope.organisationId
          && details.scope.ecoleId === scope.ecoleId
          && details.scope.utilisateurId === scope.utilisateurId
        );
      }) ?? null;
  }
}

const auditConfiguration = new AuditConfigurationMemoirePort();
const readModelConfiguration = new ConfigurationReadModelMemoire(
  registreConfiguration.repositoryConfiguration,
);
const effectiveReadModelConfiguration = new EffectiveConfigurationReadModelMemoire(
  readModelConfiguration,
);
const snapshotsReadModelConfiguration = new ConfigurationSnapshotReadModelMemoire(
  registreConfiguration.repositorySnapshots,
);
const createConfigurationUseCase = new CreateConfigurationUseCase(
  registreConfiguration.repositoryConfiguration,
  auditConfiguration,
  registreConfiguration.monitoring,
);
const updateConfigurationUseCase = new UpdateConfigurationUseCase(
  registreConfiguration.repositoryConfiguration,
  registreConfiguration.repositoryVersions,
  auditConfiguration,
  registreConfiguration.monitoring,
);
const configurationModulesService = new ServiceActivationModulesConfiguration(
  readModelConfiguration,
  createConfigurationUseCase,
  updateConfigurationUseCase,
);

export const moduleActivationConfigurationService = configurationModulesService;

function composerRoutesConfiguration(): DependancesRoutesConfiguration {
  const suppression = new SuppressionConfigurationMemoirePort(
    registreConfiguration.repositoryConfiguration,
  );
  const configurationController = new ControleurConfigurationHttp(
    createConfigurationUseCase,
    updateConfigurationUseCase,
    new DeleteConfigurationUseCase(
      readModelConfiguration,
      suppression,
      registreConfiguration.propagateur,
      auditConfiguration,
      registreConfiguration.monitoring,
    ),
    new LockConfigurationUseCase(
      registreConfiguration.repositoryConfiguration,
      auditConfiguration,
      registreConfiguration.monitoring,
    ),
    new UnlockConfigurationUseCase(
      registreConfiguration.repositoryConfiguration,
      auditConfiguration,
      registreConfiguration.monitoring,
    ),
    new GetConfigurationUseCase(readModelConfiguration),
    new GetEffectiveConfigurationUseCase(effectiveReadModelConfiguration),
    new OverrideConfigurationUseCase(
      registreConfiguration.repositoryConfiguration,
      auditConfiguration,
      registreConfiguration.monitoring,
    ),
  );

  const propagationController = new ControleurPropagationConfigurationHttp(
    new PropagateConfigurationUseCase(
      readModelConfiguration,
      new ServiceApplicationPropagationConfiguration(registreConfiguration.propagateur),
    ),
  );
  const reloadController = new ControleurReloadRuntimeConfigurationHttp(
    new ReloadRuntimeConfigurationUseCase(
      readModelConfiguration,
      registreConfiguration.rechargeurRuntime,
    ),
  );
  const validationController = new ControleurValidationConfigurationHttp(
    new ValidateConfigurationUseCase(),
  );
  const snapshotsController = new ControleurSnapshotsConfigurationHttp(
    new CreateSnapshotConfigurationUseCase(
      registreConfiguration.repositoryConfiguration,
      registreConfiguration.repositorySnapshots,
      auditConfiguration,
      registreConfiguration.monitoring,
    ),
    new CompareSnapshotsConfigurationUseCase(snapshotsReadModelConfiguration),
  );

  return {
    controleurConfigurationHttp: configurationController,
    controleurPropagationConfigurationHttp: propagationController,
    controleurReloadRuntimeConfigurationHttp: reloadController,
    controleurValidationConfigurationHttp: validationController,
    controleurSnapshotsConfigurationHttp: snapshotsController,
    middlewares: {
      auth: async (requete, reponse) => {
        if (!requete.context?.utilisateurId) {
          reponse.code(401).send({
            code: 'CONFIGURATION_AUTH_REQUIRED',
            message: 'Authentification requise.',
          });
        }
      },
      verifierPermission: async (permission, requete, reponse) => {
        if (reponse.sent) {
          return;
        }

        const permissions = requete.context?.permissions ?? [];
        if (!permissions.includes(permission)) {
          reponse.code(403).send({
            code: 'CONFIGURATION_PERMISSION_DENIED',
            message: `Permission requise: ${permission}`,
          });
        }
      },
      verifierScope: async (scope, requete, reponse) => {
        if (reponse.sent) {
          return;
        }

        const portee = await resoudrePorteeConfiguration(
          scope as PolitiqueScopeConfiguration,
          requete,
          readModelConfiguration,
        );

        if (estPorteeConfigurationAutorisee(requete, portee)) {
          return;
        }

        reponse.code(403).send({
          code: 'CONFIGURATION_SCOPE_DENIED',
          message: construireMessageRefusPortee(scope as PolitiqueScopeConfiguration, portee),
        });
      },
      verifierFamille: async (action, requete, reponse) => {
        const resolution = await resoudreCleEtPorteeConfigurationDepuisRequete(
          requete,
          readModelConfiguration,
        );
        if (!resolution.key || !resolution.scope) {
          return;
        }

        const autorise = requete.url.includes('/override') && action === 'WRITE'
          ? autoriserMutationConfigurationPourPorteeCible(
              requete.context?.roleActif,
              resolution.key,
              resolution.scope,
              requete.context?.utilisateurId,
            )
          : requete.url.includes('/configuration/effective') && action === 'READ'
            ? autoriserLectureConfigurationPourPorteeCible(
                requete.context?.roleActif,
                resolution.scope,
                requete.context?.utilisateurId,
              )
            : politiqueClassificationConfiguration.autoriserRole(
                action,
                requete.context?.roleActif,
                resolution.key,
                resolution.scope.niveau,
                {
                  utilisateurId: requete.context?.utilisateurId,
                  cibleUtilisateurId: resolution.scope.utilisateurId,
                },
              );

        if (!autorise) {
          reponse.code(403).send({
            code: 'CONFIGURATION_FAMILY_DENIED',
            message: `Le role actif ne peut pas ${action === 'READ' ? 'lire' : 'muter'} la famille de configuration cible.`,
          });
        }
      },
      gererErreur: async (erreur) => {
        const nom = erreur instanceof Error ? erreur.name : 'Error';
        const message = erreur instanceof Error ? erreur.message : 'Erreur configuration.';

        if (nom.includes('Introuvable')) {
          return {
            statutHttp: 404,
            corps: { code: 'CONFIGURATION_NOT_FOUND', message },
          };
        }

        if (nom.includes('Validation') || nom.includes('Invalide') || nom.includes('Interdit')) {
          return {
            statutHttp: 400,
            corps: { code: 'CONFIGURATION_BAD_REQUEST', message },
          };
        }

        return {
          statutHttp: 500,
          corps: { code: 'CONFIGURATION_INTERNAL_ERROR', message },
        };
      },
    },
  };
}

function hasPlatformScope(contexte: FastifyRequest['context']): boolean {
  return (contexte?.scopes ?? []).some(
    (scopeAcces) => scopeAcces.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
  );
}

function hasOrganisationScope(
  contexte: FastifyRequest['context'],
  organisationId?: string,
): boolean {
  if (!organisationId) {
    return false;
  }

  return (contexte?.scopes ?? []).some(
    (scopeAcces) =>
      scopeAcces.obtenirTypeScope().obtenirValeur() === 'ORGANISATION'
      && scopeAcces.obtenirValeurScope() === organisationId,
  );
}

function hasEcoleScope(contexte: FastifyRequest['context'], ecoleId?: string): boolean {
  if (!ecoleId) {
    return false;
  }

  return (contexte?.scopes ?? []).some(
    (scopeAcces) =>
      scopeAcces.obtenirTypeScope().obtenirValeur() === 'ECOLE'
      && scopeAcces.obtenirValeurScope() === ecoleId,
  );
}

async function resoudrePorteeConfiguration(
  politique: PolitiqueScopeConfiguration,
  requete: FastifyRequest,
  readModel: ConfigurationReadModelMemoire,
): Promise<PorteeConfigurationProps | null> {
  if (politique === 'SYSTEM') {
    return { niveau: 'SYSTEM' };
  }

  if (politique === 'CONFIGURATION_SCOPE_BODY') {
    return extrairePorteeDepuisBody(requete.body);
  }

  if (politique === 'CONFIGURATION_SCOPE_QUERY') {
    return extrairePorteeDepuisQuery(requete.query);
  }

  if (politique === 'CONFIGURATION_SCOPE_EXISTING') {
    const configurationId = extraireConfigurationId(requete.params);
    if (!configurationId) {
      return null;
    }

    const configuration = await readModel.trouverParId(configurationId);
    return configuration?.scope ?? null;
  }

  return null;
}

async function resoudreCleEtPorteeConfigurationDepuisRequete(
  requete: FastifyRequest,
  readModel: ConfigurationReadModelMemoire,
): Promise<{ key: string | null; scope: PorteeConfigurationProps | null }> {
  const body = requete.body as { key?: unknown; scope?: unknown } | undefined;
  if (typeof body?.key === 'string') {
    return {
      key: body.key,
      scope: normaliserPorteeConfiguration(body.scope) ?? null,
    };
  }

  const porteeBody = normaliserPorteeConfiguration(body?.scope);
  const configurationId = extraireConfigurationId(requete.params);
  if (configurationId && porteeBody) {
    const configuration = await readModel.trouverParId(configurationId);
    return {
      key: configuration?.key ?? null,
      scope: porteeBody,
    };
  }

  const query = requete.query as { keyPrefix?: unknown; niveau?: unknown; organisationId?: unknown; ecoleId?: unknown; utilisateurId?: unknown } | undefined;
  if (typeof query?.keyPrefix === 'string') {
    return {
      key: query.keyPrefix,
      scope: extrairePorteeDepuisQuery(query),
    };
  }

  if (!configurationId) {
    return { key: null, scope: null };
  }

  const configuration = await readModel.trouverParId(configurationId);
  if (!configuration) {
    return { key: null, scope: null };
  }

  return {
    key: configuration.key,
    scope: configuration.scope,
  };
}

function extraireConfigurationId(params: unknown): string | undefined {
  if (!params || typeof params !== 'object' || !('id' in params)) {
    return undefined;
  }

  const identifiant = (params as { id?: unknown }).id;
  return typeof identifiant === 'string' && identifiant.length > 0 ? identifiant : undefined;
}

function extrairePorteeDepuisBody(body: unknown): PorteeConfigurationProps | null {
  if (!body || typeof body !== 'object' || !('scope' in body)) {
    return null;
  }

  return normaliserPorteeConfiguration((body as { scope?: unknown }).scope);
}

function extrairePorteeDepuisQuery(query: unknown): PorteeConfigurationProps | null {
  if (!query || typeof query !== 'object') {
    return null;
  }

  const scope = query as {
    niveau?: unknown;
    organisationId?: unknown;
    ecoleId?: unknown;
    utilisateurId?: unknown;
  };

  if (typeof scope.niveau !== 'string') {
    return null;
  }

  return normaliserPorteeConfiguration({
    niveau: scope.niveau,
    organisationId: typeof scope.organisationId === 'string' ? scope.organisationId : undefined,
    ecoleId: typeof scope.ecoleId === 'string' ? scope.ecoleId : undefined,
    utilisateurId: typeof scope.utilisateurId === 'string' ? scope.utilisateurId : undefined,
  });
}

function normaliserPorteeConfiguration(scope: unknown): PorteeConfigurationProps | null {
  if (!scope || typeof scope !== 'object') {
    return null;
  }

  const valeur = scope as {
    niveau?: unknown;
    organisationId?: unknown;
    ecoleId?: unknown;
    utilisateurId?: unknown;
  };

  if (
    valeur.niveau !== 'SYSTEM'
    && valeur.niveau !== 'ORGANIZATION'
    && valeur.niveau !== 'SCHOOL'
    && valeur.niveau !== 'USER'
  ) {
    return null;
  }

  return {
    niveau: valeur.niveau,
    organisationId: typeof valeur.organisationId === 'string' ? valeur.organisationId : undefined,
    ecoleId: typeof valeur.ecoleId === 'string' ? valeur.ecoleId : undefined,
    utilisateurId: typeof valeur.utilisateurId === 'string' ? valeur.utilisateurId : undefined,
  };
}

function estPorteeConfigurationAutorisee(
  requete: FastifyRequest,
  portee: PorteeConfigurationProps | null,
): boolean {
  const contexte = requete.context;
  if (!contexte || !portee) {
    return false;
  }

  if (portePlateformeConfiguration(contexte)) {
    return true;
  }

  if (portee.niveau === 'SYSTEM') {
    return false;
  }

  if (portee.niveau === 'ORGANIZATION') {
    return porteOrganisationConfiguration(contexte) && hasOrganisationScope(contexte, portee.organisationId);
  }

  if (portee.niveau === 'SCHOOL') {
    return (
      (porteEcoleConfiguration(contexte) && hasEcoleScope(contexte, portee.ecoleId))
      || (porteOrganisationConfiguration(contexte) && hasOrganisationScope(contexte, portee.organisationId))
    );
  }

  return (
    contexte.utilisateurId === portee.utilisateurId
    || (porteEcoleConfiguration(contexte) && hasEcoleScope(contexte, portee.ecoleId))
    || (porteOrganisationConfiguration(contexte) && hasOrganisationScope(contexte, portee.organisationId))
  );
}

function portePlateformeConfiguration(contexte: FastifyRequest['context']): boolean {
  return (
    hasPlatformScope(contexte)
    || ROLES_PLATEFORME_CONFIGURATION.has(contexte?.roleActif ?? '')
  );
}

function porteOrganisationConfiguration(contexte: FastifyRequest['context']): boolean {
  return ROLES_ORGANISATION_CONFIGURATION.has(contexte?.roleActif ?? '');
}

function porteEcoleConfiguration(contexte: FastifyRequest['context']): boolean {
  return ROLES_ECOLE_CONFIGURATION.has(contexte?.roleActif ?? '');
}

function construireMessageRefusPortee(
  politique: PolitiqueScopeConfiguration,
  portee: PorteeConfigurationProps | null,
): string {
  if (politique === 'CONFIGURATION_SCOPE_BODY' && !portee) {
    return 'La portee cible de la configuration est requise.';
  }

  if (politique === 'CONFIGURATION_SCOPE_QUERY' && !portee) {
    return 'La portee cible doit etre fournie dans la query.';
  }

  if (politique === 'CONFIGURATION_SCOPE_EXISTING' && !portee) {
    return 'La configuration cible est introuvable ou sans portee exploitable.';
  }

  if (!portee) {
    return 'Contexte de securite requis.';
  }

  return `Portee ${portee.niveau} non autorisee pour cette operation.`;
}

function autoriserMutationConfigurationPourPorteeCible(
  roleActif: string | undefined,
  key: string,
  portee: PorteeConfigurationProps,
  utilisateurId?: string,
): boolean {
  if (portee.niveau === 'SYSTEM') {
    return ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'].includes(roleActif ?? '');
  }

  if (portee.niveau === 'ORGANIZATION') {
    return ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION'].includes(roleActif ?? '');
  }

  if (portee.niveau === 'SCHOOL') {
    if (roleActif === 'ADMIN_SYSTEME_ECOLE') {
      return true;
    }

    if (roleActif === 'ADMINISTRATEUR_ECOLE') {
      return !key.startsWith('branding.') || key === 'branding.footer' || key.startsWith('branding.footer.');
    }

    return false;
  }

  return Boolean(utilisateurId) && utilisateurId === portee.utilisateurId;
}

function autoriserLectureConfigurationPourPorteeCible(
  roleActif: string | undefined,
  portee: PorteeConfigurationProps,
  utilisateurId?: string,
): boolean {
  if (portee.niveau === 'SYSTEM') {
    return ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'].includes(roleActif ?? '');
  }

  if (portee.niveau === 'ORGANIZATION') {
    return ['PROMOTEUR_ORGANISATION', 'ADMIN_SYSTEME_ORGANISATION', 'GESTIONNAIRE_ORGANISATION'].includes(roleActif ?? '');
  }

  if (portee.niveau === 'SCHOOL') {
    return ['ADMIN_SYSTEME_ECOLE', 'ADMINISTRATEUR_ECOLE'].includes(roleActif ?? '');
  }

  return Boolean(utilisateurId) && utilisateurId === portee.utilisateurId;
}

async function appliquerMiddlewaresModules(
  dependances: DependancesRoutesConfiguration,
  requete: FastifyRequest,
  reponse: FastifyReply,
  permission: string,
): Promise<boolean> {
  const middlewares = dependances.middlewares;
  await middlewares?.auth?.(requete, reponse);
  await middlewares?.verifierPermission?.(permission, requete, reponse);
  return !reponse.sent;
}

async function verifierPorteeModules(
  requete: FastifyRequest,
  reponse: FastifyReply,
  cible: {
    organisationId?: string;
    ecoleId?: string;
    autoriserOrganisation?: boolean;
    autoriserEcole?: boolean;
  },
): Promise<boolean> {
  const contexte = requete.context;
  if (!contexte) {
    reponse.code(403).send({
      code: 'CONFIGURATION_SCOPE_DENIED',
      message: 'Contexte de securite requis.',
    });
    return false;
  }

  if (hasPlatformScope(contexte)) {
    return true;
  }

  if (
    cible.autoriserOrganisation
    && hasOrganisationScope(contexte, cible.organisationId)
  ) {
    return true;
  }

  if (cible.autoriserEcole && hasEcoleScope(contexte, cible.ecoleId)) {
    return true;
  }

  reponse.code(403).send({
    code: 'CONFIGURATION_SCOPE_DENIED',
    message: 'Portee organisation/ecole non autorisee.',
  });
  return false;
}

export const routeConfiguration: PluginRoutesConfiguration = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const dependances = composerRoutesConfiguration();

    await serveur.register(creerRoutesConfiguration(dependances));
    await serveur.register(creerRoutesSnapshotsConfiguration(dependances));
    await serveur.register(creerRoutesValidationConfiguration(dependances));
    await serveur.register(creerRoutesPropagationConfiguration(dependances));
    await serveur.register(creerRoutesReloadConfiguration(dependances));

    serveur.get('/api/v1/configuration/modules/effective', async (requete, reponse) => {
      if (!(await appliquerMiddlewaresModules(dependances, requete, reponse, 'configuration.modules.read'))) {
        return;
      }

      const query = (requete.query ?? {}) as {
        organisationId?: string;
        ecoleId?: string;
      };
      if (!query.organisationId || !query.ecoleId) {
        reponse.code(400).send({
          code: 'CONFIGURATION_MODULES_QUERY_INVALIDE',
          message: 'organisationId et ecoleId sont requis.',
        });
        return;
      }

      if (
        !(await verifierPorteeModules(requete, reponse, {
          organisationId: query.organisationId,
          ecoleId: query.ecoleId,
          autoriserOrganisation: true,
          autoriserEcole: true,
        }))
      ) {
        return;
      }

      const resolution = await configurationModulesService.resoudreModulesEffectifs({
        organisationId: query.organisationId,
        ecoleId: query.ecoleId,
      });
      reponse.code(200).send({
        succes: true,
        code: 200,
        donnees: resolution,
      });
    });

    serveur.put('/api/v1/configuration/modules/organisations/:organisationId', async (requete, reponse) => {
      if (!(await appliquerMiddlewaresModules(dependances, requete, reponse, 'configuration.modules.organization.write'))) {
        return;
      }

      const params = (requete.params ?? {}) as { organisationId?: string };
      const body = (requete.body ?? {}) as {
        modules?: readonly string[];
        actorId?: string;
      };
      if (!params.organisationId || !Array.isArray(body.modules)) {
        reponse.code(400).send({
          code: 'CONFIGURATION_MODULES_ORGANISATION_INVALIDE',
          message: 'organisationId et modules sont requis.',
        });
        return;
      }

      if (
        !(await verifierPorteeModules(requete, reponse, {
          organisationId: params.organisationId,
          autoriserOrganisation: true,
        }))
      ) {
        return;
      }

      const resultat = await configurationModulesService.configurerModulesOrganisation({
        organisationId: params.organisationId,
        modules: body.modules,
        actorId: body.actorId ?? requete.context?.utilisateurId,
        requestId: requete.id,
        correlationId: requete.headers['x-correlation-id'] as string | undefined,
      });

      reponse.code(200).send({
        succes: true,
        code: 200,
        donnees: {
          organisationId: params.organisationId,
          ...resultat,
        },
      });
    });

    serveur.put('/api/v1/configuration/modules/ecoles/:ecoleId', async (requete, reponse) => {
      if (!(await appliquerMiddlewaresModules(dependances, requete, reponse, 'configuration.modules.school.write'))) {
        return;
      }

      const params = (requete.params ?? {}) as { ecoleId?: string };
      const body = (requete.body ?? {}) as {
        organisationId?: string;
        modules?: readonly string[];
        actorId?: string;
      };
      if (!params.ecoleId || !body.organisationId || !Array.isArray(body.modules)) {
        reponse.code(400).send({
          code: 'CONFIGURATION_MODULES_ECOLE_INVALIDE',
          message: 'organisationId, ecoleId et modules sont requis.',
        });
        return;
      }

      if (
        !(await verifierPorteeModules(requete, reponse, {
          organisationId: body.organisationId,
          ecoleId: params.ecoleId,
          autoriserEcole: true,
        }))
      ) {
        return;
      }

      const resultat = await configurationModulesService.configurerModulesEcole({
        organisationId: body.organisationId,
        ecoleId: params.ecoleId,
        modules: body.modules,
        actorId: body.actorId ?? requete.context?.utilisateurId,
        requestId: requete.id,
        correlationId: requete.headers['x-correlation-id'] as string | undefined,
      });

      reponse.code(200).send({
        succes: true,
        code: 200,
        donnees: {
          organisationId: body.organisationId,
          ecoleId: params.ecoleId,
          ...resultat,
        },
      });
    });

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-configuration',
          prefixe: routeConfiguration.prefixe,
        },
      },
      'Routes Configuration enregistrees.',
    );
  },
  {
    nom: 'configuration',
    prefixe: '/api/v1',
  },
);
