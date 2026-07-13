import {
  type Configuration,
  RuntimeConfiguration,
} from '../../shared/configuration';
import type {
  NotificationConfigurationChange,
} from '../../shared/notifications/integration/configuration';
import { obtenirNotificationsRuntime } from '../plugins/notifications-runtime';

type AppliquerNotificationConfiguration = (
  changement: NotificationConfigurationChange,
) => Promise<void>;

interface ProjectionRuntimeMutable {
  retry: {
    actif: boolean;
    tentativesMaximales: number;
    backoffSecondes: number;
  };
  replay: {
    actif: boolean;
    tailleLotMaximale: number;
  };
  cache: {
    ttlSecondes: number;
    synchronisationActive: boolean;
  };
  reload: {
    propagationActive: boolean;
    reloadRuntimeActif: boolean;
    restartRequisPourClesCritiques: boolean;
  };
  scheduler: {
    actif: boolean;
    frequenceSecondes: number;
  };
}

// Ce fichier orchestre l application runtime reelle des reglages persistants.

/** Cette classe synchronise les reglages Configuration vers les consommateurs runtime actifs. */
export class ConfigurationRuntimeSynchronisationService {
  private runtimeCourant = new RuntimeConfiguration(this.construireRuntimeParDefautProps());

  constructor(
    private readonly listerConfigurations: () => Promise<readonly Configuration[]>,
    private readonly appliquerNotificationConfiguration: AppliquerNotificationConfiguration = async (
      changement,
    ) => {
      await obtenirNotificationsRuntime().appliquerConfiguration(changement);
    },
  ) {}

  /** Cette methode applique l etat courant complet au demarrage des runtimes dependants. */
  public async synchroniserAuDemarrage(): Promise<void> {
    const configurations = await this.listerConfigurations();
    this.runtimeCourant = this.projeterRuntime(configurations);

    for (const configuration of configurations) {
      const changement = this.convertirConfigurationNotification(configuration);
      if (changement) {
        await this.appliquerNotificationConfiguration(changement);
      }
    }
  }

  /** Cette methode recharge une configuration et rehydrate les etats runtime concernes. */
  public async rechargerConfiguration(
    configurationId: string,
    _forcer: boolean,
  ): Promise<void> {
    const configurations = await this.listerConfigurations();
    this.runtimeCourant = this.projeterRuntime(configurations);

    const configuration = configurations.find(
      (entree) => entree.details().identifiant === configurationId,
    );
    if (!configuration) {
      return;
    }

    const changement = this.convertirConfigurationNotification(configuration);
    if (changement) {
      await this.appliquerNotificationConfiguration(changement);
    }
  }

  /** Cette methode expose l etat runtime actuellement projete depuis Configuration. */
  public obtenirRuntimeCourant(): RuntimeConfiguration {
    return new RuntimeConfiguration(this.runtimeCourant.valeur());
  }

  private projeterRuntime(configurations: readonly Configuration[]): RuntimeConfiguration {
    const base = this.construireRuntimeParDefautProps();

    for (const configuration of configurations) {
      const details = configuration.details();
      if (details.scope.niveau !== 'SYSTEM') {
        continue;
      }

      if (details.key === 'runtime.retry.maxAttempts' && typeof details.valeur === 'number') {
        base.retry.tentativesMaximales = details.valeur;
      }

      if (details.key === 'runtime.replay.enabled' && typeof details.valeur === 'boolean') {
        base.replay.actif = details.valeur;
      }

      if (details.key === 'runtime.cache.ttlSeconds' && typeof details.valeur === 'number') {
        base.cache.ttlSecondes = details.valeur;
      }
    }

    return new RuntimeConfiguration(base);
  }

  private convertirConfigurationNotification(
    configuration: Configuration,
  ): NotificationConfigurationChange | null {
    const details = configuration.details();
    if (!this.estConfigurationNotificationRuntime(details.key, details.scope.niveau)) {
      return null;
    }

    const valeurs = this.projeterValeursNotification(details.key, details.valeur);
    if (!valeurs) {
      return null;
    }

    return {
      contexteConfiguration: {
        configurationId: details.identifiant,
        scopeLevel: this.convertirScope(details.scope.niveau),
        organisationId: details.scope.organisationId,
        ecoleId: details.scope.ecoleId,
        changedAt: new Date().toISOString(),
      },
      source: this.determinerSourceNotification(details.key),
      valeurs,
    };
  }

  private estConfigurationNotificationRuntime(
    key: string,
    niveau: ReturnType<Configuration['details']>['scope']['niveau'],
  ): boolean {
    return key.startsWith('notifications.')
      && !key.startsWith('notifications.preferences.')
      && niveau !== 'USER';
  }

  private determinerSourceNotification(
    key: string,
  ): NotificationConfigurationChange['source'] {
    if (key.startsWith('notifications.providers.')) {
      return 'PROVIDER';
    }
    if (key.startsWith('notifications.quotas.')) {
      return 'QUOTA';
    }
    if (key.startsWith('notifications.templates.')) {
      return 'TEMPLATE';
    }

    return 'RUNTIME';
  }

  private projeterValeursNotification(
    key: string,
    valeur: unknown,
  ): Readonly<Record<string, unknown>> | null {
    if (key.startsWith('notifications.providers.')) {
      return this.projeterProviderNotification(key, valeur);
    }
    if (key.startsWith('notifications.quotas.')) {
      return this.projeterQuotaNotification(key, valeur);
    }
    if (key.startsWith('notifications.templates.')) {
      return this.projeterTemplateNotification(key, valeur);
    }

    return { [key]: valeur };
  }

  private projeterProviderNotification(
    key: string,
    valeur: unknown,
  ): Readonly<Record<string, unknown>> | null {
    const resultat = /^notifications\.providers\.([a-z_]+)\.(enabled|timeoutMs|batchSize|failureThreshold)$/u.exec(
      key,
    );
    if (!resultat) {
      return null;
    }

    const canal = this.convertirCanal(resultat[1]);
    const propriete = resultat[2];
    if (!canal) {
      return null;
    }

    const projection: Record<string, unknown> = { canal };
    if (propriete === 'enabled') {
      projection.actif = valeur;
    }
    if (propriete === 'timeoutMs') {
      projection.timeoutMs = valeur;
    }
    if (propriete === 'batchSize') {
      projection.tailleLotMaximale = valeur;
    }
    if (propriete === 'failureThreshold') {
      projection.tentativeMaximaleAvantPanne = valeur;
    }

    return projection;
  }

  private projeterQuotaNotification(
    key: string,
    valeur: unknown,
  ): Readonly<Record<string, unknown>> | null {
    const resultat = /^notifications\.quotas\.([a-z_]+)\.(hourlyLimit|dailyLimit|dailyBudget)$/u.exec(
      key,
    );
    if (!resultat) {
      return null;
    }

    const canal = this.convertirCanal(resultat[1]);
    const propriete = resultat[2];
    if (!canal) {
      return null;
    }

    const projection: Record<string, unknown> = { canal };
    if (propriete === 'hourlyLimit') {
      projection.limiteParHeure = valeur;
    }
    if (propriete === 'dailyLimit') {
      projection.limiteParJour = valeur;
    }
    if (propriete === 'dailyBudget') {
      projection.budgetJournalier = valeur;
    }

    return projection;
  }

  private projeterTemplateNotification(
    key: string,
    valeur: unknown,
  ): Readonly<Record<string, unknown>> | null {
    if (key === 'notifications.templates.strictRendering') {
      return { renduStrict: valeur };
    }
    if (key === 'notifications.templates.requiredPlaceholders') {
      return { placeholdersRequis: valeur };
    }
    if (key === 'notifications.templates.cacheTtlMs') {
      return { ttlCacheMs: valeur };
    }
    if (key === 'notifications.templates.allowFallbackContent') {
      return { autoriserFallbackContenu: valeur };
    }

    return null;
  }

  private convertirScope(
    niveau: ReturnType<Configuration['details']>['scope']['niveau'],
  ): 'GLOBAL' | 'ENVIRONNEMENT' | 'ORGANISATION' | 'ECOLE' {
    if (niveau === 'SYSTEM') {
      return 'GLOBAL';
    }
    if (niveau === 'ORGANIZATION') {
      return 'ORGANISATION';
    }
    return 'ECOLE';
  }

  private convertirCanal(valeur: string): string | null {
    const map: Record<string, string> = {
      in_app: 'IN_APP',
      sms: 'SMS',
      email: 'EMAIL',
      whatsapp: 'WHATSAPP',
      push: 'PUSH',
      webhook: 'WEBHOOK',
    };

    return map[valeur] ?? null;
  }

  private construireRuntimeParDefautProps(): ProjectionRuntimeMutable {
    return {
      retry: {
        actif: true,
        tentativesMaximales: 3,
        backoffSecondes: 60,
      },
      replay: {
        actif: true,
        tailleLotMaximale: 50,
      },
      cache: {
        ttlSecondes: 120,
        synchronisationActive: true,
      },
      reload: {
        propagationActive: true,
        reloadRuntimeActif: true,
        restartRequisPourClesCritiques: false,
      },
      scheduler: {
        actif: true,
        frequenceSecondes: 30,
      },
    };
  }
}
