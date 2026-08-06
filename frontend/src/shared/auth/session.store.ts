import { computed, reactive } from 'vue';
import { actorProfiles } from '../doctrine/frontend-doctrine';
import type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';
import {
  createEmptyEffectiveProfile,
  normalizeEffectiveProfile,
} from '../permissions/effective-profile';
import {
  hasDerivedCapability as profileHasDerivedCapability,
  listEffectiveActorCodes,
} from '../permissions/effective-access.engine';
import type {
  DerivedCapabilityCode,
  EffectiveAccessTarget,
  EffectiveProfilePayloadV1,
  EffectiveProfileV1,
} from '../permissions/effective-profile.types';

export type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';

export interface FrontendSessionState {
  isAuthenticated: boolean;
  actorCode: FrontendActorCode;
  actorLabel: string;
  displayName: string;
  userId: string;
  sessionId: string | null;
  accessToken: string | null;
  email: string;
  authMode: 'none' | 'dev' | 'backend' | 'offline';
  isOfflineSession: boolean;
  initialized: boolean;
  initializing: boolean;
  initializationRequired: boolean;
  lastTerminationReason: 'none' | 'logout' | 'revoked' | 'expired';
  permissions: readonly string[];
  effectiveProfile: EffectiveProfileV1;
}

function findProfile(actorCode: FrontendActorCode): FrontendActorProfile | undefined {
  return actorProfiles.find((profile) => profile.code === actorCode);
}

const defaultProfile = actorProfiles.find(
  (profile) => profile.code === 'ADMINISTRATEUR_ECOLE',
) as FrontendActorProfile;
const initialProfile = defaultProfile;

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
  isOfflineSession: false,
  initialized: false,
  initializing: false,
  initializationRequired: false,
  lastTerminationReason: 'none',
  permissions: [],
  effectiveProfile: createEmptyEffectiveProfile(),
});

export const sessionStore = {
  state,
  actorProfiles,
  activeProfile: computed(() => findProfile(state.actorCode) ?? defaultProfile),
  effectiveGovernanceLevels: computed<readonly FrontendGovernanceLevel[]>(() => {
    const scopeTypes = new Set(
      state.effectiveProfile.scopes.map((scope) => scope.typeScope),
    );
    if (scopeTypes.has('PLATEFORME')) {
      return ['PLATEFORME', 'ORGANISATION', 'ECOLE'];
    }
    if (scopeTypes.has('ORGANISATION')) {
      return ['ORGANISATION', 'ECOLE'];
    }
    if (
      scopeTypes.has('ECOLE')
      || scopeTypes.has('SECTION')
      || scopeTypes.has('CLASSE')
      || scopeTypes.has('COURS')
    ) {
      return ['ECOLE'];
    }
    return [];
  }),
  effectiveActorCodes: computed(() => listEffectiveActorCodes(state.effectiveProfile)),
  hasDerivedCapability(
    capability: DerivedCapabilityCode,
    target?: EffectiveAccessTarget,
  ): boolean {
    return profileHasDerivedCapability(state.effectiveProfile, capability, target);
  },
  beginInitialization(): void {
    state.initializing = true;
  },
  completeInitialization(mode: 'dev' | 'backend' | 'offline' | 'none'): void {
    state.initializing = false;
    state.initialized = true;
    state.authMode = mode;
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
      if (profile) {
        state.actorCode = profile.code;
        state.actorLabel = profile.label;
      }
    }
    state.accessToken = params.accessToken;
    state.sessionId = params.sessionId;
    state.userId = params.userId;
    state.displayName =
      params.displayName?.trim()
      || state.displayName
      || findProfile(state.actorCode)?.displayName
      || defaultProfile.displayName;
    state.email = params.email?.trim() || state.email;
    state.permissions = params.permissions ? [...params.permissions] : [];
    // Le transport authentifie ne constitue jamais une preuve d'autorisation.
    // La navigation reste fermee jusqu'a la projection effective signee par le serveur.
    state.effectiveProfile = createEmptyEffectiveProfile();
    state.isAuthenticated = true;
    state.authMode = params.developer ? 'dev' : 'backend';
    state.isOfflineSession = false;
    state.lastTerminationReason = 'none';
  },
  applyOfflineSession(params: {
    sessionId: string;
    userId: string;
    actorCode: FrontendActorCode;
    displayName: string;
    email: string;
    effectiveProfile: EffectiveProfilePayloadV1;
  }): void {
    const profile = findProfile(params.actorCode);
    state.actorCode = params.actorCode;
    state.actorLabel = profile?.label ?? params.actorCode;
    state.accessToken = null;
    state.sessionId = params.sessionId;
    state.userId = params.userId;
    state.displayName = params.displayName;
    state.email = params.email;
    state.isAuthenticated = true;
    state.authMode = 'offline';
    state.isOfflineSession = true;
    state.lastTerminationReason = 'none';
    this.applyEffectiveProfile(params.effectiveProfile);
  },
  applyEffectiveProfile(payload: EffectiveProfilePayloadV1): void {
    const normalized = normalizeEffectiveProfile(payload, {
      actorCode: state.actorCode,
      userId: state.userId,
      sessionId: state.sessionId ?? '',
      governanceLevel: findProfile(state.actorCode)?.governanceLevels[0] ?? 'ECOLE',
    });
    const knownActor = [
      normalized.roleActif,
      ...normalized.actorCodes,
    ].find((actorCode) =>
      actorProfiles.some((profile) => profile.code === actorCode),
    ) as FrontendActorCode | undefined;
    if (knownActor) {
      state.actorCode = knownActor;
      state.actorLabel = findProfile(knownActor)?.label ?? state.actorLabel;
    }
    state.permissions = [...normalized.permissionsEffectives];
    state.effectiveProfile = normalized;
  },
  setInitializationRequired(required: boolean): void {
    state.initializationRequired = required;
  },
  invalidateEffectiveProfile(): void {
    state.permissions = [];
    state.effectiveProfile = createEmptyEffectiveProfile();
  },
  clearBackendSession(reason: FrontendSessionState['lastTerminationReason'] = 'none'): void {
    state.accessToken = null;
    state.sessionId = null;
    state.userId = '';
    state.displayName = '';
    state.email = '';
    state.authMode = 'none';
    state.isOfflineSession = false;
    state.isAuthenticated = false;
    state.lastTerminationReason = reason;
    state.permissions = [];
    state.effectiveProfile = createEmptyEffectiveProfile();
  },
};
