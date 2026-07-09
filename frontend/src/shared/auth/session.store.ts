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
  authMode: 'dev' | 'backend';
  initialized: boolean;
  initializing: boolean;
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
  isAuthenticated: true,
  actorCode: initialProfile.code,
  actorLabel: initialProfile.label,
  displayName: initialProfile.displayName,
  userId: 'usr-demo-admin-ecole',
  sessionId: null,
  accessToken: null,
  authMode: 'dev',
  initialized: false,
  initializing: false,
});

export const sessionStore = {
  state,
  actorProfiles,
  activeProfile: computed(() => findProfile(state.actorCode)),
  beginInitialization(): void {
    state.initializing = true;
  },
  completeInitialization(mode: 'dev' | 'backend'): void {
    state.initializing = false;
    state.initialized = true;
    state.authMode = mode;
  },
  setActor(actorCode: string): void {
    const profile = findProfile(actorCode as FrontendActorCode);
    state.actorCode = profile.code;
    state.actorLabel = profile.label;
    state.displayName = profile.displayName;
    state.userId = `usr-${profile.code.toLowerCase()}`;
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
  }): void {
    state.accessToken = params.accessToken;
    state.sessionId = params.sessionId;
    state.userId = params.userId;
    state.isAuthenticated = true;
    state.authMode = 'backend';
  },
  clearBackendSession(): void {
    state.accessToken = null;
    state.sessionId = null;
    state.authMode = 'dev';
    state.isAuthenticated = true;
  },
};
