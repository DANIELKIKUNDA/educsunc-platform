export type AuthEntryMode = 'developer' | 'login';

// La production refuse toujours le mode developpeur, meme en cas de mauvaise configuration.
export function resolveAuthEntryMode(
  environment = import.meta.env.MODE,
  configuredMode = import.meta.env.VITE_AUTH_ENTRY_MODE,
): AuthEntryMode {
  if (environment === 'production') {
    return 'login';
  }

  return configuredMode === 'login' ? 'login' : 'developer';
}

export const authEntryMode = resolveAuthEntryMode();
