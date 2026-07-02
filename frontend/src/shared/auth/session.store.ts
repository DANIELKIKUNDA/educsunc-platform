import { computed, reactive } from 'vue';
import { actorProfiles } from '../doctrine/frontend-doctrine';
import type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';

export type { FrontendActorCode, FrontendActorProfile, FrontendGovernanceLevel } from '../doctrine/doctrine.types';

export interface FrontendSessionState {
  isAuthenticated: boolean;
  actorCode: FrontendActorCode;
  actorLabel: string;
  displayName: string;
  userId: string;
}

function findProfile(actorCode: FrontendActorCode): FrontendActorProfile {
  return actorProfiles.find((profile) => profile.code === actorCode) ?? actorProfiles[0];
}

const initialProfile = findProfile('ADMINISTRATEUR_ECOLE');

const state = reactive<FrontendSessionState>({
  isAuthenticated: true,
  actorCode: initialProfile.code,
  actorLabel: initialProfile.label,
  displayName: initialProfile.displayName,
  userId: 'usr-demo-admin-ecole',
});

export const sessionStore = {
  state,
  actorProfiles,
  activeProfile: computed(() => findProfile(state.actorCode)),
  setActor(actorCode: string): void {
    const profile = findProfile(actorCode as FrontendActorCode);
    state.actorCode = profile.code;
    state.actorLabel = profile.label;
    state.displayName = profile.displayName;
    state.userId = `usr-${profile.code.toLowerCase()}`;
  },
};
