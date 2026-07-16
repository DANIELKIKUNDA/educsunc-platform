import { computed, reactive } from 'vue';
import { actorProfiles } from '../doctrine/frontend-doctrine';
import type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';

export type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';

const DEV_SESSION_STORAGE_KEY = 'educsync.frontend.dev-session';

export interface FrontendSessionState {
  isAuthenticated: boolean;
  actorCode: FrontendActorCode;
  actorLabel: string;
  displayName: string;
  userId: string;
  sessionId: string | null;
  accessToken: string | null;
  email: string;
  authMode: 'none' | 'dev' | 'backend';
  initialized: boolean;
  initializing: boolean;
  initializationRequired: boolean;
  lastTerminationReason: 'none' | 'logout' | 'revoked' | 'expired';
  permissions: readonly string[];
}

function findProfile(actorCode: FrontendActorCode): FrontendActorProfile {
  return actorProfiles.find((profile) => profile.code === actorCode) ?? actorProfiles[0];
}

function lireSessionDevPersisted(): { actorCode?: FrontendActorCode } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const brut = window.localStorage.getItem(DEV_SESSION_STORAGE_KEY);
  if (!brut) {
    return null;
  }

  try {
    return JSON.parse(brut) as { actorCode?: FrontendActorCode };
  } catch {
    return null;
  }
}

function persisterSessionDev(actorCode: FrontendActorCode): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    DEV_SESSION_STORAGE_KEY,
    JSON.stringify({ actorCode }),
  );
}

const initialProfile = findProfile(
  lireSessionDevPersisted()?.actorCode ?? 'ADMINISTRATEUR_ECOLE',
);

const state = reactive<FrontendSessionState>({
  isAuthenticated: false,
  actorCode: initialProfile.code,
  actorLabel: initialProfile.label,
  displayName: '',
  email: '',
  userId: '',
  sessionId: null,
  accessToken: null,
  authMode: 'none',
  initialized: false,
  initializing: false,
  initializationRequired: false,
  lastTerminationReason: 'none',
  permissions: [],
});

export const sessionStore = {
  state,
  actorProfiles,
  activeProfile: computed(() => findProfile(state.actorCode)),
  beginInitialization(): void {
    state.initializing = true;
  },
  completeInitialization(mode: 'dev' | 'backend' | 'none'): void {
    state.initializing = false;
    state.initialized = true;
    state.authMode = mode;
  },
  setActor(actorCode: string): void {
    const profile = findProfile(actorCode as FrontendActorCode);
    state.actorCode = profile.code;
    state.actorLabel = profile.label;
    if (!state.displayName) {
      state.displayName = profile.displayName;
    }
    persisterSessionDev(profile.code);
  },
  setTransportSession(params: { accessToken: string; sessionId: string }): void {
    state.accessToken = params.accessToken;
    state.sessionId = params.sessionId;
  },
  applyBackendSession(params: {
    accessToken: string;
    sessionId: string;
    userId: string;
    actorCode?: string;
    displayName?: string;
    email?: string;
    developer?: boolean;
    permissions?: readonly string[];
  }): void {
    if (params.actorCode) {
      const profile = findProfile(params.actorCode as FrontendActorCode);
      state.actorCode = profile.code;
      state.actorLabel = profile.label;
    }
    state.accessToken = params.accessToken;
    state.sessionId = params.sessionId;
    state.userId = params.userId;
    state.displayName = params.displayName?.trim() || state.displayName || findProfile(state.actorCode).displayName;
    state.email = params.email?.trim() || state.email;
    state.permissions = params.permissions ? [...params.permissions] : state.permissions;
    state.isAuthenticated = true;
    state.authMode = params.developer ? 'dev' : 'backend';
    state.lastTerminationReason = 'none';
  },
  setInitializationRequired(required: boolean): void {
    state.initializationRequired = required;
  },
  clearBackendSession(reason: FrontendSessionState['lastTerminationReason'] = 'none'): void {
    state.accessToken = null;
    state.sessionId = null;
    state.userId = '';
    state.displayName = '';
    state.email = '';
    state.authMode = 'none';
    state.isAuthenticated = false;
    state.lastTerminationReason = reason;
    state.permissions = [];
  },
};
