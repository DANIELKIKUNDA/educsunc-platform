import { reactive } from 'vue';

export interface FrontendSessionState {
  isAuthenticated: boolean;
  actorCode: string;
  actorLabel: string;
  displayName: string;
}

const state = reactive<FrontendSessionState>({
  isAuthenticated: true,
  actorCode: 'ADMINISTRATEUR_ECOLE',
  actorLabel: 'Administrateur ecole',
  displayName: 'Daniel Kikunda',
});

export const sessionStore = {
  state,
  setActor(actorCode: string, actorLabel: string): void {
    state.actorCode = actorCode;
    state.actorLabel = actorLabel;
  },
};
