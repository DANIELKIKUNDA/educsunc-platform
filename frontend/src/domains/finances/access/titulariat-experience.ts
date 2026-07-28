import { sessionStore } from '../../../shared/auth/session.store';

export const TITULARIAT_EFFECTIF = 'TITULAIRE_EFFECTIF' as const;

export function hasTitulariatEffectif(): boolean {
  if (sessionStore.state.actorCode !== 'ENSEIGNANT') {
    return false;
  }

  return sessionStore.hasDerivedCapability(TITULARIAT_EFFECTIF);
}
