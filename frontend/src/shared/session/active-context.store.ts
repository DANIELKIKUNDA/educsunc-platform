import { computed, reactive } from 'vue';
import type { FrontendGovernanceLevel } from '../auth/session.store';

const ACTIVE_CONTEXT_STORAGE_KEY = 'educsync.frontend.active-context';

interface SchoolContextOption {
  id: string;
  name: string;
  sectionName: string;
  years: readonly SchoolYearContextOption[];
}

interface SchoolYearContextOption {
  id: string;
  label: string;
}

interface OrganizationContextOption {
  id: string;
  name: string;
  schools: readonly SchoolContextOption[];
}

interface PersistedFrontendContext {
  governanceLevel?: FrontendGovernanceLevel;
  organizationId?: string;
  schoolId?: string;
  schoolYearId?: string;
}

export interface ActiveFrontendContext {
  governanceLevel: FrontendGovernanceLevel;
  organizationId: string;
  organizationName: string;
  schoolId: string;
  schoolName: string;
  sectionName: string;
  schoolYearId: string;
  schoolYearLabel: string;
}

const initialOrganizations: readonly OrganizationContextOption[] = [
  {
    id: 'org-archedu',
    name: 'Archi Logiciel Education',
    schools: [
      {
        id: 'ecole-saint-raphael',
        name: 'College Saint Raphael',
        sectionName: 'Secondaire',
        years: [
          { id: 'annee-saint-raphael-2025-2026', label: '2025 - 2026' },
          { id: 'annee-saint-raphael-2024-2025', label: '2024 - 2025' },
        ],
      },
      {
        id: 'ecole-sainte-marie',
        name: 'Ecole Sainte Marie',
        sectionName: 'Primaire',
        years: [
          { id: 'annee-sainte-marie-2025-2026', label: '2025 - 2026' },
          { id: 'annee-sainte-marie-2024-2025', label: '2024 - 2025' },
        ],
      },
    ],
  },
  {
    id: 'org-edusync-demo',
    name: 'Fondation EduSync Demo',
    schools: [
      {
        id: 'ecole-lumumba',
        name: 'Institut Patrice Lumumba',
        sectionName: 'Secondaire',
        years: [
          { id: 'annee-lumumba-2025-2026', label: '2025 - 2026' },
          { id: 'annee-lumumba-2024-2025', label: '2024 - 2025' },
        ],
      },
    ],
  },
];

const organizationsState = reactive<OrganizationContextOption[]>(
  initialOrganizations.map((organization) => ({
    ...organization,
    schools: [...organization.schools],
  })),
);

function lireContextePersisted(): PersistedFrontendContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const brut = window.localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY);
  if (!brut) {
    return null;
  }

  try {
    return JSON.parse(brut) as PersistedFrontendContext;
  } catch {
    return null;
  }
}

function findOrganization(organizationId: string): OrganizationContextOption {
  return organizationsState.find((organization) => organization.id === organizationId) ?? {
    id: organizationId,
    name: organizationId,
    schools: organizationsState[0]?.schools ?? [],
  };
}

function findSchool(organization: OrganizationContextOption, schoolId: string): SchoolContextOption {
  return organization.schools.find((school) => school.id === schoolId) ?? {
    id: schoolId,
    name: schoolId,
    sectionName: organization.schools[0]?.sectionName ?? 'Non renseignee',
    years: organization.schools[0]?.years ?? [{ id: `annee-${schoolId}`, label: '2025 - 2026' }],
  };
}

function getFirstSchoolYear(school: SchoolContextOption): SchoolYearContextOption {
  return school.years[0] ?? { id: '', label: '' };
}

function resolveSchoolYear(
  school: SchoolContextOption,
  schoolYearLabelOrId: string,
): SchoolYearContextOption {
  return school.years.find((year) => year.id === schoolYearLabelOrId || year.label === schoolYearLabelOrId)
    ?? getFirstSchoolYear(school);
}

function upsertOrganizationOption(option: OrganizationContextOption): void {
  const index = organizationsState.findIndex((organization) => organization.id === option.id);
  if (index >= 0) {
    organizationsState[index] = {
      ...organizationsState[index],
      ...option,
      schools: [...option.schools],
    };
    return;
  }

  organizationsState.push({
    ...option,
    schools: [...option.schools],
  });
}

const contextePersisted = lireContextePersisted();
const initialOrganization = findOrganization(contextePersisted?.organizationId ?? organizationsState[0].id);
const initialSchool = findSchool(initialOrganization, contextePersisted?.schoolId ?? initialOrganization.schools[0]?.id ?? '');
const initialSchoolYear = contextePersisted?.schoolYearId
  ? resolveSchoolYear(initialSchool, contextePersisted.schoolYearId)
  : getFirstSchoolYear(initialSchool);

const state = reactive<ActiveFrontendContext>({
  governanceLevel: contextePersisted?.governanceLevel ?? 'ECOLE',
  organizationId: initialOrganization.id,
  organizationName: initialOrganization.name,
  schoolId: initialSchool.id,
  schoolName: initialSchool.name,
  sectionName: initialSchool.sectionName,
  schoolYearId: initialSchoolYear.id,
  schoolYearLabel: initialSchoolYear.label,
});

function persisterContexteActif(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    ACTIVE_CONTEXT_STORAGE_KEY,
    JSON.stringify({
      governanceLevel: state.governanceLevel,
      organizationId: state.organizationId,
      schoolId: state.schoolId,
      schoolYearId: state.schoolYearId,
    } satisfies PersistedFrontendContext),
  );
}

export const activeContextStore = {
  state,
  organizations: organizationsState,
  organizationOptions: computed(() => organizationsState),
  schoolOptions: computed(() => findOrganization(state.organizationId).schools),
  schoolYearOptions: computed(() => findSchool(findOrganization(state.organizationId), state.schoolId).years),
  setGovernanceLevel(governanceLevel: FrontendGovernanceLevel): void {
    state.governanceLevel = governanceLevel;
    persisterContexteActif();
  },
  ensureAllowedLevel(levels: readonly FrontendGovernanceLevel[]): void {
    if (levels.includes(state.governanceLevel)) {
      return;
    }

    state.governanceLevel = levels[0] ?? 'ECOLE';
    persisterContexteActif();
  },
  setOrganization(organizationId: string): void {
    const organization = findOrganization(organizationId);
    const school = organization.schools[0];
    const schoolYear = getFirstSchoolYear(school);
    state.organizationId = organization.id;
    state.organizationName = organization.name;
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label;
    persisterContexteActif();
  },
  setSchool(schoolId: string): void {
    const organization = findOrganization(state.organizationId);
    const school = findSchool(organization, schoolId);
    const schoolYear = getFirstSchoolYear(school);
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label;
    persisterContexteActif();
  },
  setSchoolYear(schoolYearLabelOrId: string, schoolYearId?: string): void {
    const school = findSchool(findOrganization(state.organizationId), state.schoolId);
    const schoolYear = schoolYearId
      ? school.years.find((year) => year.id === schoolYearId) ?? resolveSchoolYear(school, schoolYearLabelOrId)
      : resolveSchoolYear(school, schoolYearLabelOrId);
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label;
    persisterContexteActif();
  },
  remplacerAnneesScolairesEcole(
    schoolId: string,
    schoolYears: ReadonlyArray<{
      id: string;
      label: string;
    }>,
  ): void {
    const organisation = findOrganization(state.organizationId);
    const ecoles = [...organisation.schools];
    const index = ecoles.findIndex((ecole) => ecole.id === schoolId);

    if (index < 0) {
      return;
    }

    ecoles[index] = {
      ...ecoles[index],
      years: schoolYears.length > 0 ? [...schoolYears] : ecoles[index].years,
    };

    upsertOrganizationOption({
      id: organisation.id,
      name: organisation.name,
      schools: ecoles,
    });

    if (state.schoolId === schoolId && schoolYears.length > 0) {
      state.schoolYearId = schoolYears[0].id;
      state.schoolYearLabel = schoolYears[0].label;
      persisterContexteActif();
    }
  },
  remplacerOrganisationsDepuisBackend(
    organisations: ReadonlyArray<{
      id: string;
      nom: string;
    }>,
  ): void {
    for (const organisation of organisations) {
      upsertOrganizationOption({
        id: organisation.id,
        name: organisation.nom,
        schools: findOrganization(organisation.id).schools,
      });
    }
  },
  remplacerEcolesDepuisBackend(
    organizationId: string,
    ecoles: ReadonlyArray<{
      id: string;
      nom: string;
    }>,
  ): void {
    const organisation = findOrganization(organizationId);
    upsertOrganizationOption({
      id: organisation.id,
      name: organisation.name,
      schools: ecoles.map((ecole) => ({
        id: ecole.id,
        name: ecole.nom,
        sectionName: findSchool(organisation, ecole.id).sectionName,
        years: findSchool(organisation, ecole.id).years,
      })),
    });
  },
  enregistrerOrganisation(
    organisation: {
      id: string;
      nom: string;
    },
  ): void {
    upsertOrganizationOption({
      id: organisation.id,
      name: organisation.nom,
      schools: findOrganization(organisation.id).schools,
    });
  },
  enregistrerEcole(
    payload: {
      idOrganisation: string;
      id: string;
      nom: string;
    },
  ): void {
    const organisation = findOrganization(payload.idOrganisation);
    const ecoles = [...organisation.schools];
    const index = ecoles.findIndex((ecole) => ecole.id === payload.id);
    const nouvelleEcole: SchoolContextOption = {
      id: payload.id,
      name: payload.nom,
      sectionName: index >= 0 ? ecoles[index].sectionName : 'Secondaire',
      years: index >= 0 ? ecoles[index].years : [{ id: `annee-${payload.id}`, label: '2025 - 2026' }],
    };

    if (index >= 0) {
      ecoles[index] = nouvelleEcole;
    } else {
      ecoles.push(nouvelleEcole);
    }

    upsertOrganizationOption({
      id: organisation.id,
      name: organisation.name,
      schools: ecoles,
    });
  },
  applyResolvedContext(params: {
    organizationId?: string | null;
    schoolId?: string | null;
  }): void {
    const organizationId = params.organizationId ?? state.organizationId;
    const organization = findOrganization(organizationId);
    const schoolId = params.schoolId ?? state.schoolId;
    const school = findSchool(organization, schoolId);
    const schoolYear = getFirstSchoolYear(school);

    state.organizationId = organization.id;
    state.organizationName = organization.name;
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label || state.schoolYearLabel;
    persisterContexteActif();
  },
};
