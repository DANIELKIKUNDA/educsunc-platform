// Cette constante regroupe les tokens interdits dans le contenu transporte par les notifications.
export const TOKENS_INTERDITS_NOTIFICATION = ['password', 'refresh', 'jwt', 'secret', 'apiKey', 'stackTrace'] as const;

// Cette constante regroupe quelques types critiques explicitement signales par le document.
export const TYPES_CRITIQUES_NOTIFICATION = [
  'CONNEXION_SUSPECTE',
  'INCIDENT_SECURITE',
  'SYNC_FAILURE',
  'RETRY_STORM',
  'QUEUE_SATURATION',
  'PROVIDER_DOWN',
  'WORKER_CRASH',
  'REPLAY_MASSIF',
] as const;
