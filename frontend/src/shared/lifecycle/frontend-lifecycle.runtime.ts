import { getCurrentScope, onScopeDispose, watch } from 'vue';
import { sessionStore } from '../auth/session.store';
import { activeContextStore } from '../session/active-context.store';
import {
  FrontendLifecycleCoordinator,
  type FrontendLifecycleSnapshot,
  type FrontendStoreScope,
} from './frontend-lifecycle.coordinator';

function authorizationSignature(): string {
  const profile = sessionStore.state.effectiveProfile;
  return JSON.stringify({
    permissions: [...profile.permissionsEffectives].sort(),
    scopes: profile.scopes
      .map((scope) => [
        scope.typeScope,
        scope.valeurScope,
        scope.estLectureSeule,
        scope.idOrganisation ?? '',
        scope.idEcole ?? '',
        scope.idSection ?? '',
        scope.idClasse ?? '',
        scope.idCours ?? '',
      ])
      .sort(),
    restrictions: [...profile.restrictions].sort(),
    modules: [...profile.modulesEffectifs].sort(),
    titulariats: profile.titulariats.effectifs
      .map((titulariat) => [
        titulariat.idOrganisation,
        titulariat.idEcole,
        titulariat.idClasse,
        titulariat.idAnneeScolaire,
      ])
      .sort(),
    elevesAutorises: [...profile.ownership.elevesAutorises].sort(),
    compteActif: profile.compte.actif,
    sessionActive: profile.session.actif,
  });
}

function readSnapshot(): FrontendLifecycleSnapshot {
  return {
    authenticated: sessionStore.state.isAuthenticated,
    sessionId: sessionStore.state.sessionId ?? '',
    userId: sessionStore.state.userId,
    actorCode: sessionStore.state.actorCode,
    permissionsSignature: authorizationSignature(),
    governanceLevel: activeContextStore.state.governanceLevel,
    organizationId: activeContextStore.state.organizationId,
    schoolId: activeContextStore.state.schoolId,
    schoolYearId: activeContextStore.state.schoolYearId,
  };
}

export const frontendLifecycle = new FrontendLifecycleCoordinator(readSnapshot());

watch(
  readSnapshot,
  (snapshot) => {
    frontendLifecycle.update(snapshot);
  },
  { flush: 'sync' },
);

let scopedStoreSequence = 0;

export function registerScopedLifecycleStore(
  id: string,
  scope: FrontendStoreScope,
  reset: () => void,
): () => void {
  const registrationId = `${id}:${++scopedStoreSequence}`;
  const unregister = frontendLifecycle.registerStore({
    id: registrationId,
    scope,
    reset,
  });

  if (getCurrentScope()) {
    onScopeDispose(unregister);
  }
  return unregister;
}
