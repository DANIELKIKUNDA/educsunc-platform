import { CanalNotification } from '../../../domain';
import type { ConfigurationContext } from 'shared/configuration';
import {
  ConfigurationNotificationRuntime,
  ConfigurationProvidersNotification,
  ConfigurationQuotasNotification,
  ConfigurationTemplatesNotification,
  type ConfigurationCanalProviderNotification,
  type ConfigurationQuotaCanalNotification,
  type ConfigurationTemplateNotification,
} from '../../../infrastructure/config';
import { NotificationConfigurationMapper } from '../mappers/NotificationConfigurationMapper';
import type {
  NotificationConfigurationChange,
  NotificationConfigurationIntegrationSnapshot,
} from '../NotificationsConfigurationIntegrationTypes';
import { NotificationConfigurationQuotasBridge } from '../quotas/NotificationConfigurationQuotasBridge';
import { NotificationConfigurationRuntimeBridge } from '../runtime/NotificationConfigurationRuntimeBridge';
import { NotificationConfigurationTemplatesBridge } from '../templates/NotificationConfigurationTemplatesBridge';

// Ce fichier orchestre le pont entre le module Configuration et le module Notifications.

const CANAUX_CONFIGURATION_PROVIDERS: readonly CanalNotification[] = [
  'IN_APP',
  'SMS',
  'EMAIL',
  'WHATSAPP',
  'PUSH',
  'WEBHOOK',
];

/** Cette classe centralise la synchronisation des fragments Configuration utiles a Notifications. */
export class NotificationsConfigurationIntegrationOrchestrator {
  public readonly runtime: NotificationConfigurationRuntimeBridge;
  public readonly quotas: NotificationConfigurationQuotasBridge;
  public readonly templates: NotificationConfigurationTemplatesBridge;

  private readonly configurationProvidersNotification: ConfigurationProvidersNotification;
  private readonly changements: NotificationConfigurationChange[] = [];
  private contexteCourant?: ConfigurationContext;

  /** Ce constructeur assemble les briques techniques de configuration deja posees dans Notifications. */
  constructor(params?: {
    readonly configurationNotificationRuntime?: ConfigurationNotificationRuntime;
    readonly configurationProvidersNotification?: ConfigurationProvidersNotification;
    readonly configurationTemplatesNotification?: ConfigurationTemplatesNotification;
    readonly configurationQuotasNotification?: ConfigurationQuotasNotification;
  }) {
    const configurationProvidersNotification =
      params?.configurationProvidersNotification ?? new ConfigurationProvidersNotification();
    const configurationTemplatesNotification =
      params?.configurationTemplatesNotification ?? new ConfigurationTemplatesNotification();
    const configurationQuotasNotification =
      params?.configurationQuotasNotification ?? new ConfigurationQuotasNotification();
    const configurationNotificationRuntime =
      params?.configurationNotificationRuntime ??
      new ConfigurationNotificationRuntime(
        configurationProvidersNotification,
        configurationTemplatesNotification,
        configurationQuotasNotification,
      );

    this.configurationProvidersNotification = configurationProvidersNotification;
    this.runtime = new NotificationConfigurationRuntimeBridge(configurationNotificationRuntime);
    this.quotas = new NotificationConfigurationQuotasBridge(configurationQuotasNotification);
    this.templates = new NotificationConfigurationTemplatesBridge(configurationTemplatesNotification);
  }

  /** Cette methode applique un changement de configuration au moteur Notifications. */
  public async appliquerChangement(changement: NotificationConfigurationChange): Promise<void> {
    this.contexteCourant = { ...changement.contexteConfiguration };
    this.changements.push({
      ...changement,
      valeurs: { ...changement.valeurs },
    });
    if (this.changements.length > 250) {
      this.changements.splice(0, this.changements.length - 250);
    }

    switch (changement.source) {
      case 'RUNTIME':
      case 'FEATURE_FLAG':
      case 'THROTTLING':
        this.runtime.appliquerFragment(
          NotificationConfigurationMapper.versFragmentRuntime(
            changement.contexteConfiguration,
            changement.valeurs,
          ),
        );
        break;
      case 'PROVIDER':
        this.appliquerProvider(changement.valeurs);
        break;
      case 'TEMPLATE':
        this.templates.appliquerConfiguration(
          changement.valeurs as Partial<ConfigurationTemplateNotification>,
        );
        break;
      case 'QUOTA':
        this.appliquerQuota(changement.valeurs);
        break;
      default:
        this.runtime.appliquerFragment(
          NotificationConfigurationMapper.versFragmentRuntime(
            changement.contexteConfiguration,
            changement.valeurs,
          ),
        );
        break;
    }
  }

  /** Cette methode lit une valeur de configuration via le pont runtime. */
  public async lire<T>(cle: string, valeurParDefaut: T): Promise<T> {
    return this.runtime.lire(cle, valeurParDefaut);
  }

  /** Cette methode expose un snapshot simple du pont Configuration vers Notifications. */
  public obtenirSnapshot(): NotificationConfigurationIntegrationSnapshot {
    return {
      totalChangements: this.changements.length,
      totalFragmentsRuntime: this.changements.filter((changement) =>
        changement.source === 'RUNTIME' ||
        changement.source === 'FEATURE_FLAG' ||
        changement.source === 'THROTTLING',
      ).length,
      contexteCourant: this.contexteCourant,
      runtime: this.runtime.obtenirInstantane(),
      providers: this.listerProviders(),
      templates: this.templates.obtenirConfiguration(),
      quotas: this.quotas.listerQuotas(),
    };
  }

  /** Cette methode applique un fragment provider sur le canal cible. */
  private appliquerProvider(valeurs: Readonly<Record<string, unknown>>): void {
    const canal = valeurs.canal;
    if (!this.estCanalNotification(canal)) {
      return;
    }

    const configuration: ConfigurationCanalProviderNotification = {
      canal,
      actif: Boolean(valeurs.actif ?? true),
      timeoutMs: this.lireNombre(valeurs.timeoutMs, 30_000),
      tailleLotMaximale: this.lireNombre(valeurs.tailleLotMaximale, 100),
      tentativeMaximaleAvantPanne: this.lireNombre(valeurs.tentativeMaximaleAvantPanne, 3),
    };
    this.configurationProvidersNotification.definirConfiguration(configuration);
  }

  /** Cette methode applique un fragment quota sur le canal cible. */
  private appliquerQuota(valeurs: Readonly<Record<string, unknown>>): void {
    const canal = valeurs.canal;
    if (!this.estCanalNotification(canal)) {
      return;
    }

    const quota: ConfigurationQuotaCanalNotification = {
      canal,
      limiteParHeure: this.lireNombre(valeurs.limiteParHeure, 1_000),
      limiteParJour: this.lireNombre(valeurs.limiteParJour, 8_000),
      budgetJournalier: this.lireNombre(valeurs.budgetJournalier, 2_500),
    };
    this.quotas.appliquerQuota(quota);
  }

  /** Cette methode retourne les configurations providers connues. */
  private listerProviders(): ConfigurationCanalProviderNotification[] {
    return CANAUX_CONFIGURATION_PROVIDERS.map((canal) =>
      this.configurationProvidersNotification.obtenirConfiguration(canal),
    );
  }

  /** Cette methode valide qu'une valeur correspond a un canal Notifications connu. */
  private estCanalNotification(valeur: unknown): valeur is CanalNotification {
    return valeur === 'IN_APP' ||
      valeur === 'SMS' ||
      valeur === 'EMAIL' ||
      valeur === 'WHATSAPP' ||
      valeur === 'PUSH' ||
      valeur === 'WEBHOOK';
  }

  /** Cette methode convertit une valeur potentiellement inconnue en nombre avec fallback. */
  private lireNombre(valeur: unknown, valeurParDefaut: number): number {
    return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : valeurParDefaut;
  }
}
