import type { ConfigurationContext } from 'shared/configuration';
import type {
  ConfigurationCanalProviderNotification,
  ConfigurationQuotaCanalNotification,
  ConfigurationTemplateNotification,
  InstantaneConfigurationNotificationRuntime,
} from '../../infrastructure/config';

// Ce fichier declare les types partages du pont entre Configuration et Notifications.

/** Cette interface represente un changement de configuration applique au module Notifications. */
export interface NotificationConfigurationChange {
  readonly contexteConfiguration: ConfigurationContext;
  readonly valeurs: Readonly<Record<string, unknown>>;
  readonly source:
    | 'RUNTIME'
    | 'PROVIDER'
    | 'TEMPLATE'
    | 'QUOTA'
    | 'FEATURE_FLAG'
    | 'THROTTLING';
}

/** Cette interface represente un fragment runtime normalise pour Notifications. */
export interface NotificationConfigurationRuntimeFragment {
  readonly valeurs: Readonly<Record<string, unknown>>;
  readonly changedAt: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

/** Cette interface represente le snapshot local du pont Configuration vers Notifications. */
export interface NotificationConfigurationIntegrationSnapshot {
  readonly totalChangements: number;
  readonly totalFragmentsRuntime: number;
  readonly contexteCourant?: ConfigurationContext;
  readonly runtime: InstantaneConfigurationNotificationRuntime;
  readonly providers: readonly ConfigurationCanalProviderNotification[];
  readonly templates: ConfigurationTemplateNotification;
  readonly quotas: readonly ConfigurationQuotaCanalNotification[];
}
