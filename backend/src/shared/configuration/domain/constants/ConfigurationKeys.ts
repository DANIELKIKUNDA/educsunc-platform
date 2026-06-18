// Ce fichier centralise les cles de configuration les plus importantes du domaine.

/** Cette constante expose un noyau de cles officielles de configuration. */
export const CLES_CONFIGURATION = [
  'branding.logo.primary',
  'branding.colors.primary',
  'branding.colors.secondary',
  'modules.allowed',
  'modules.enabled',
  'notifications.quotas.sms',
  'notifications.templates.default',
  'runtime.retry.maxAttempts',
  'runtime.replay.enabled',
  'runtime.cache.ttlSeconds',
] as const;
