import { sessionStore } from '../auth/session.store';
import type { EffectiveProfileV1 } from './effective-profile.types';

export function isStudentOwnedByActiveParent(
  profile: EffectiveProfileV1,
  idEleve: string | undefined,
): boolean {
  if (profile.roleActif !== 'PARENT') {
    return true;
  }

  const normalizedStudentId = idEleve?.trim();
  return Boolean(
    normalizedStudentId
    && profile.ownership.elevesAutorises.includes(normalizedStudentId),
  );
}

export function isOwnedStudentTargetAllowed(idEleve: string | undefined): boolean {
  return isStudentOwnedByActiveParent(sessionStore.state.effectiveProfile, idEleve);
}
