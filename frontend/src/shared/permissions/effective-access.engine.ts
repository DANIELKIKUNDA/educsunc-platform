import type {
  DerivedCapabilityCode,
  EffectiveAccessDecision,
  EffectiveAccessRequirement,
  EffectiveAccessTarget,
  EffectiveProfileV1,
  EffectiveScope,
} from './effective-profile.types';

function includesAny(values: readonly string[], expected: readonly string[]): boolean {
  return expected.some((value) => values.includes(value));
}

export function listEffectiveActorCodes(profile: EffectiveProfileV1): string[] {
  // Les autres acteurs servent a proposer un changement explicite de profil.
  // Ils ne doivent jamais autoriser l'interface tant qu'ils ne sont pas actifs.
  return profile.roleActif ? [profile.roleActif] : [];
}

export function hasDerivedCapability(
  profile: EffectiveProfileV1,
  capability: DerivedCapabilityCode,
  target?: EffectiveAccessTarget,
): boolean {
  if (capability === 'TITULAIRE_EFFECTIF') {
    if (!profile.titulariats.estTitulaireEffectif) {
      return false;
    }
    if (!target?.classeId) {
      return profile.titulariats.effectifs.length > 0;
    }
    return profile.titulariats.effectifs.some((titulariat) =>
      titulariat.idClasse === target.classeId
      && (!target.anneeScolaireId
        || titulariat.idAnneeScolaire === target.anneeScolaireId)
      && (!target.organisationId
        || titulariat.idOrganisation === target.organisationId)
      && (!target.ecoleId || titulariat.idEcole === target.ecoleId),
    );
  }
  return false;
}

function scopeValueMatches(actual: string | undefined, expected: string): boolean {
  return expected === '*' || (actual !== undefined && actual === expected);
}

function scopeMatchesTarget(scope: EffectiveScope, target: EffectiveAccessTarget): boolean {
  if (scope.valeurScope === '*') {
    return true;
  }

  switch (scope.typeScope) {
    case 'PLATEFORME':
      return true;
    case 'ORGANISATION':
      return scopeValueMatches(target.organisationId, scope.valeurScope);
    case 'ECOLE':
      return scopeValueMatches(target.ecoleId, scope.valeurScope);
    case 'SECTION':
      return target.sectionId
        ? scopeValueMatches(target.sectionId, scope.valeurScope)
        : Boolean(scope.idEcole && scopeValueMatches(target.ecoleId, scope.idEcole));
    case 'CLASSE':
      return target.classeId
        ? scopeValueMatches(target.classeId, scope.valeurScope)
        : Boolean(scope.idEcole && scopeValueMatches(target.ecoleId, scope.idEcole));
    case 'COURS':
      return target.coursId
        ? scopeValueMatches(target.coursId, scope.valeurScope)
        : Boolean(scope.idEcole && scopeValueMatches(target.ecoleId, scope.idEcole));
    default:
      return false;
  }
}

function findMatchingScope(
  profile: EffectiveProfileV1,
  target: EffectiveAccessTarget,
): EffectiveScope | undefined {
  return profile.scopes.find((scope) => scopeMatchesTarget(scope, target));
}

export function evaluateEffectiveAccess(
  profile: EffectiveProfileV1,
  requirement: EffectiveAccessRequirement,
  target: EffectiveAccessTarget,
): EffectiveAccessDecision {
  if (!profile.resolved) {
    return { allowed: false, reason: 'PROFILE_UNRESOLVED' };
  }
  if (!profile.compte.actif) {
    return { allowed: false, reason: 'ACCOUNT_INACTIVE' };
  }
  if (!profile.session.actif) {
    return { allowed: false, reason: 'SESSION_INACTIVE' };
  }

  const effectiveActors = listEffectiveActorCodes(profile);
  if (
    requirement.actorCodes
    && requirement.actorCodes.length > 0
    && !includesAny(effectiveActors, requirement.actorCodes)
  ) {
    return { allowed: false, reason: 'ACTOR_DENIED' };
  }
  if (
    requirement.governanceLevels
    && requirement.governanceLevels.length > 0
    && !requirement.governanceLevels.includes(target.governanceLevel)
  ) {
    return { allowed: false, reason: 'LEVEL_DENIED' };
  }
  if (
    requirement.permissionsAllOf
    && !requirement.permissionsAllOf.every((permission) =>
      profile.permissionsEffectives.includes(permission),
    )
  ) {
    return { allowed: false, reason: 'PERMISSION_DENIED' };
  }
  if (
    requirement.permissionsAnyOf
    && requirement.permissionsAnyOf.length > 0
    && !includesAny(profile.permissionsEffectives, requirement.permissionsAnyOf)
  ) {
    return { allowed: false, reason: 'PERMISSION_DENIED' };
  }
  if (
    requirement.derivedCapabilitiesAnyOf
    && requirement.derivedCapabilitiesAnyOf.length > 0
    && !requirement.derivedCapabilitiesAnyOf.some((capability) =>
      hasDerivedCapability(profile, capability, target),
    )
  ) {
    return { allowed: false, reason: 'DERIVED_CAPABILITY_MISSING' };
  }
  if (requirement.ownedStudent) {
    if (target.eleveId) {
      if (!profile.ownership.elevesAutorises.includes(target.eleveId)) {
        return { allowed: false, reason: 'OWNERSHIP_DENIED' };
      }
    } else if (profile.ownership.elevesAutorises.length === 0) {
      return { allowed: false, reason: 'OWNERSHIP_DENIED' };
    }
  }
  if (
    requirement.commercialModule
    && (requirement.moduleRequiredAt ?? ['ORGANISATION', 'ECOLE']).includes(target.governanceLevel)
    && !profile.modulesEffectifs.includes(requirement.commercialModule)
  ) {
    return { allowed: false, reason: 'MODULE_INACTIVE' };
  }
  if (
    requirement.blockedByRestrictions
    && includesAny(profile.restrictions, requirement.blockedByRestrictions)
  ) {
    return { allowed: false, reason: 'RESTRICTION_APPLIED' };
  }

  if (requirement.scope === 'SELF') {
    const targetUserId = target.utilisateurId ?? profile.contexte.utilisateurId;
    if (!targetUserId || targetUserId !== profile.compte.id) {
      return { allowed: false, reason: 'SCOPE_DENIED' };
    }
    return { allowed: true };
  }

  if (requirement.scope === 'NONE') {
    return { allowed: true };
  }

  const matchedScope = findMatchingScope(profile, target);
  if (!matchedScope) {
    return { allowed: false, reason: 'SCOPE_DENIED' };
  }
  if (requirement.mutation && matchedScope.estLectureSeule) {
    return { allowed: false, reason: 'READ_ONLY_SCOPE', matchedScope };
  }

  return { allowed: true, matchedScope };
}
