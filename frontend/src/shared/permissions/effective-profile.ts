import type { FrontendActorCode, FrontendGovernanceLevel } from '../doctrine/doctrine.types';
import {
  COMMERCIAL_MODULE_CODES,
  type CommercialModuleCode,
  type EffectiveAccessContext,
  type EffectiveDerivedTitulariat,
  type EffectiveProfilePayloadV1,
  type EffectiveProfileV1,
  type EffectiveScope,
  type EffectiveScopeType,
  type EffectiveTitulariat,
} from './effective-profile.types';

const SCOPE_TYPES = new Set<EffectiveScopeType>([
  'PLATEFORME',
  'ORGANISATION',
  'ECOLE',
  'SECTION',
  'CLASSE',
  'COURS',
]);

function uniqueStrings(values: readonly unknown[] | undefined): string[] {
  return [
    ...new Set(
      (values ?? [])
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function optionalString(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized || undefined;
}

function normalizeScope(scope: Partial<EffectiveScope>): EffectiveScope | null {
  const typeScope = String(scope.typeScope ?? '').trim().toUpperCase() as EffectiveScopeType;
  const valeurScope = optionalString(scope.valeurScope);
  if (!SCOPE_TYPES.has(typeScope) || !valeurScope) {
    return null;
  }

  return {
    typeScope,
    valeurScope,
    estLectureSeule: scope.estLectureSeule === true,
    idOrganisation: optionalString(scope.idOrganisation),
    idEcole: optionalString(scope.idEcole),
    idSection: optionalString(scope.idSection),
    idClasse: optionalString(scope.idClasse),
    idCours: optionalString(scope.idCours),
  };
}

function normalizeTitulariat(value: Partial<EffectiveTitulariat>): EffectiveTitulariat | null {
  const idUtilisateur = optionalString(value.idUtilisateur);
  const idOrganisation = optionalString(value.idOrganisation);
  const idEcole = optionalString(value.idEcole);
  const idClasse = optionalString(value.idClasse);
  const idAnneeScolaire = optionalString(value.idAnneeScolaire);
  if (!idUtilisateur || !idOrganisation || !idEcole || !idClasse || !idAnneeScolaire) {
    return null;
  }

  return {
    idAffectationTitulariat: optionalString(value.idAffectationTitulariat) ?? '',
    idUtilisateur,
    idOrganisation,
    idEcole,
    idClasse,
    idAnneeScolaire,
    estActif: value.estActif !== false,
  };
}

function normalizeDerivedTitulariat(
  value: Partial<EffectiveDerivedTitulariat>,
): EffectiveDerivedTitulariat | null {
  const idOrganisation = optionalString(value.idOrganisation);
  const idEcole = optionalString(value.idEcole);
  const idClasse = optionalString(value.idClasse);
  const idAnneeScolaire = optionalString(value.idAnneeScolaire);
  const idSectionScolaire = optionalString(value.idSectionScolaire);
  const source = value.source;
  if (
    !idOrganisation
    || !idEcole
    || !idClasse
    || !idAnneeScolaire
    || !idSectionScolaire
    || (source !== 'AFFECTATION_TITULARIAT' && source !== 'RESPONSABILITE_CLASSE')
  ) {
    return null;
  }

  return {
    idOrganisation,
    idEcole,
    idClasse,
    idAnneeScolaire,
    idSectionScolaire,
    source,
  };
}

function normalizeContext(
  context: EffectiveProfilePayloadV1['contexte'],
  fallback: EffectiveAccessContext,
): EffectiveAccessContext {
  return {
    governanceLevel:
      context?.governanceLevel
      ?? context?.niveauGouvernance
      ?? context?.niveau
      ?? fallback.governanceLevel,
    utilisateurId: optionalString(context?.utilisateurId ?? context?.idUtilisateur)
      ?? fallback.utilisateurId,
    organisationId: optionalString(context?.organisationId ?? context?.idOrganisation)
      ?? fallback.organisationId,
    ecoleId: optionalString(context?.ecoleId ?? context?.idEcole)
      ?? fallback.ecoleId,
    sectionId: optionalString(context?.sectionId ?? context?.idSection)
      ?? fallback.sectionId,
    classeId: optionalString(context?.classeId ?? context?.idClasse)
      ?? fallback.classeId,
    coursId: optionalString(context?.coursId ?? context?.idCours)
      ?? fallback.coursId,
    anneeScolaireId: optionalString(context?.anneeScolaireId ?? context?.idAnneeScolaire)
      ?? fallback.anneeScolaireId,
  };
}

function normalizeModules(values: readonly string[] | undefined): CommercialModuleCode[] {
  return uniqueStrings(values).filter((value): value is CommercialModuleCode =>
    COMMERCIAL_MODULE_CODES.includes(value as CommercialModuleCode),
  );
}

export function createEmptyEffectiveProfile(): EffectiveProfileV1 {
  return {
    version: 1,
    resolved: false,
    source: 'AUCUNE',
    actorCodes: [],
    permissionsEffectives: [],
    scopes: [],
    restrictions: [],
    modulesEffectifs: [],
    compte: { id: '', actif: false },
    session: { id: '', actif: false },
    contexte: { governanceLevel: 'PLATEFORME' },
    titulariats: {
      actifs: [],
      effectifs: [],
      estTitulaireEffectif: false,
      source: 'AUCUNE',
    },
    ownership: {
      elevesAutorises: [],
    },
  };
}

export function normalizeEffectiveProfile(
  payload: EffectiveProfilePayloadV1,
  fallback: {
    actorCode: FrontendActorCode;
    userId: string;
    sessionId: string;
    governanceLevel: FrontendGovernanceLevel;
  },
): EffectiveProfileV1 {
  const capabilities = payload.capacitesEffectives;
  const permissionsEffectives = uniqueStrings(
    payload.permissionsEffectives
    ?? capabilities?.permissions
    ?? payload.permissions,
  );
  const actorCodes = uniqueStrings([
    ...(payload.actorCodes ?? []),
    payload.acteurCode,
    payload.actorCode,
    payload.acteurCodeActif,
    payload.roleActif,
  ]).filter(Boolean);
  const titulariats = (
    payload.titulariats?.actifs
    ?? payload.titulariatsActifs
    ?? capabilities?.titulariatsActifs
    ?? []
  ).map(normalizeTitulariat).filter((value): value is EffectiveTitulariat => value !== null);
  const titulariatsEffectifs = (
    payload.titulariats?.effectifs
    ?? payload.titulariatsEffectifs
    ?? capabilities?.titulariatsEffectifs
    ?? []
  )
    .map(normalizeDerivedTitulariat)
    .filter((value): value is EffectiveDerivedTitulariat => value !== null);
  const estTitulaireEffectif =
    payload.titulariats?.estTitulaireEffectif
    ?? payload.estTitulaireEffectif
    ?? capabilities?.estTitulaireEffectif
    ?? false;
  const modulesEffectifs = normalizeModules(payload.modulesEffectifs);
  const contexte = normalizeContext(payload.contexte, {
    governanceLevel: fallback.governanceLevel,
    utilisateurId: fallback.userId,
  });
  const scopes = (payload.scopes ?? [])
    .map(normalizeScope)
    .filter((value): value is EffectiveScope => value !== null)
    .map((scope) => ({
      ...scope,
      idOrganisation: scope.idOrganisation ?? contexte.organisationId,
      idEcole: scope.idEcole ?? contexte.ecoleId,
    }));
  const requestedActiveRole = optionalString(
    payload.acteurCodeActif
    ?? payload.roleActif
    ?? payload.acteurCode
    ?? payload.actorCode,
  );
  const roleActif =
    requestedActiveRole && actorCodes.includes(requestedActiveRole)
      ? requestedActiveRole
      : undefined;

  return {
    version: 1,
    resolved: actorCodes.length > 0 && roleActif !== undefined,
    source: 'PROFIL_EFFECTIF',
    actorCodes,
    roleActif,
    permissionsEffectives,
    scopes,
    restrictions: uniqueStrings(payload.restrictions ?? capabilities?.restrictions),
    modulesEffectifs,
    compte: {
      id: optionalString(payload.compte?.id ?? payload.compte?.idUtilisateur) ?? fallback.userId,
      actif:
        payload.compte?.actif
        ?? (optionalString(payload.compte?.etat ?? payload.compte?.statut) === 'ACTIVE'),
      statut: optionalString(payload.compte?.statut ?? payload.compte?.etat) ?? 'ACTIVE',
    },
    session: {
      id: optionalString(payload.session?.id ?? payload.session?.idSession) ?? fallback.sessionId,
      actif:
        payload.session?.actif
        ?? (optionalString(payload.session?.etat ?? payload.session?.statut) === 'ACTIVE'),
      statut: optionalString(payload.session?.statut ?? payload.session?.etat) ?? 'ACTIVE',
    },
    contexte,
    titulariats: {
      actifs: titulariats,
      effectifs: titulariatsEffectifs,
      estTitulaireEffectif,
      source:
        payload.titulariats?.source
        ?? payload.sourceTitulariatEffectif
        ?? capabilities?.sourceTitulariatEffectif
        ?? 'AUCUNE',
    },
    ownership: {
      elevesAutorises: uniqueStrings(payload.ownership?.elevesAutorises),
    },
  };
}
