import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';

export const TITULARIAT_EFFECTIF = 'TITULAIRE_EFFECTIF' as const;

export function hasTitulariatEffectif(): boolean {
  if (sessionStore.state.actorCode !== 'ENSEIGNANT') {
    return false;
  }

  return sessionStore.hasDerivedCapability(TITULARIAT_EFFECTIF);
}

export function isTitulariatTargetAllowed(
  idClasse: string,
  idAnneeScolaire: string,
): boolean {
  if (sessionStore.state.actorCode !== 'ENSEIGNANT') {
    return true;
  }

  const context = activeContextStore.state;
  return sessionStore.hasDerivedCapability(TITULARIAT_EFFECTIF, {
    governanceLevel: context.governanceLevel,
    organisationId: context.organizationId || undefined,
    ecoleId: context.schoolId || undefined,
    classeId: idClasse.trim() || undefined,
    anneeScolaireId: idAnneeScolaire.trim() || undefined,
  });
}
