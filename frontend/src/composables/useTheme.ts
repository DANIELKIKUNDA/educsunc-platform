import { computed, readonly, ref } from 'vue';
import {
  configurationApi,
  type UserThemePreference,
} from '../domains/configuration/services/configuration.api';
import { sessionStore } from '../shared/auth/session.store';

type ResolvedTheme = 'light' | 'dark';

const CACHE_PREFIX = 'educsync.theme';
const themePreference = ref<UserThemePreference>('system');
const resolvedTheme = ref<ResolvedTheme>('light');
const synchronizing = ref(false);
const synchronizationError = ref<string | null>(null);
let mediaQuery: MediaQueryList | null = null;
let initialized = false;

function cacheKey(): string {
  const userId = sessionStore.state.userId.trim() || 'anonymous';
  return `${CACHE_PREFIX}.${userId}`;
}

function isThemePreference(value: unknown): value is UserThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function resolveTheme(preference: UserThemePreference): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }

  return mediaQuery?.matches ? 'dark' : 'light';
}

function applyTheme(preference: UserThemePreference, persistCache = true): void {
  themePreference.value = preference;
  resolvedTheme.value = resolveTheme(preference);
  document.documentElement.setAttribute('data-theme', resolvedTheme.value);

  if (persistCache) {
    window.localStorage.setItem(cacheKey(), preference);
  }
}

function readCachedTheme(): UserThemePreference {
  const cached = window.localStorage.getItem(cacheKey());
  return isThemePreference(cached) ? cached : 'system';
}

function onSystemThemeChanged(): void {
  if (themePreference.value === 'system') {
    applyTheme('system');
  }
}

function ensureMediaListener(): void {
  if (mediaQuery) {
    return;
  }

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', onSystemThemeChanged);
}

async function initializeTheme(): Promise<void> {
  ensureMediaListener();
  applyTheme(readCachedTheme());

  if (sessionStore.state.authMode !== 'backend' || !sessionStore.state.userId) {
    initialized = true;
    return;
  }

  synchronizing.value = true;
  synchronizationError.value = null;
  try {
    const response = await configurationApi.consulterThemeUtilisateur();
    applyTheme(response.donnees.theme);
  } catch {
    synchronizationError.value = "La preference d'affichage n'a pas pu etre relue.";
  } finally {
    synchronizing.value = false;
    initialized = true;
  }
}

async function setTheme(preference: UserThemePreference): Promise<boolean> {
  ensureMediaListener();
  const previous = themePreference.value;

  document.documentElement.classList.add('theme-transition');
  applyTheme(preference);
  synchronizing.value = true;
  synchronizationError.value = null;

  try {
    if (sessionStore.state.authMode === 'backend') {
      const response = await configurationApi.enregistrerThemeUtilisateur(preference);
      applyTheme(response.donnees.theme);
    }
    return true;
  } catch {
    applyTheme(previous);
    synchronizationError.value = "Le theme n'a pas pu etre enregistre. Votre choix precedent a ete conserve.";
    return false;
  } finally {
    synchronizing.value = false;
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }
}

async function toggleTheme(): Promise<boolean> {
  return setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  if (typeof window !== 'undefined' && !initialized) {
    ensureMediaListener();
  }

  return {
    theme: readonly(themePreference),
    resolvedTheme: readonly(resolvedTheme),
    isDark: computed(() => resolvedTheme.value === 'dark'),
    synchronizing: readonly(synchronizing),
    synchronizationError: readonly(synchronizationError),
    toggleTheme,
    setTheme,
    initTheme: initializeTheme,
  };
}
