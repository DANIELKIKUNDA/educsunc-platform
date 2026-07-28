import { computed, reactive } from 'vue';
import type { FrontendGovernanceLevel } from '../auth/session.store';

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

// Les options sont alimentees par les scopes et les lectures backend.
// Aucun tenant de demonstration ne doit devenir un contexte autorise implicite.
const organizationsState = reactive<OrganizationContextOption[]>([]);

function findOrganization(organizationId: string): OrganizationContextOption {
  return organizationsState.find((organization) => organization.id === organizationId) ?? {
    id: organizationId,
    name: organizationId,
    schools: [],
  };
}

function findSchool(organization: OrganizationContextOption, schoolId: string): SchoolContextOption {
  return organization.schools.find((school) => school.id === schoolId) ?? {
    id: schoolId,
    name: schoolId,
    sectionName: '',
    years: [],
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

function appliquerOrganisationAuContexte(organisation: OrganizationContextOption): void {
  state.organizationId = organisation.id;
  state.organizationName = organisation.name;
  viderContexteEcole();
}

const state = reactive<ActiveFrontendContext>({
  governanceLevel: 'PLATEFORME',
  organizationId: '',
  organizationName: '',
  schoolId: '',
  schoolName: '',
  sectionName: '',
  schoolYearId: '',
  schoolYearLabel: '',
});

function viderContexteEcole(): void {
  state.schoolId = '';
  state.schoolName = '';
  state.sectionName = '';
  state.schoolYearId = '';
  state.schoolYearLabel = '';
}

function viderContexteOrganisationEtEcole(): void {
  state.organizationId = '';
  state.organizationName = '';
  viderContexteEcole();
}

export const activeContextStore = {
  state,
  organizations: organizationsState,
  organizationOptions: computed(() => organizationsState),
  schoolOptions: computed(() => findOrganization(state.organizationId).schools),
  schoolYearOptions: computed(() => findSchool(findOrganization(state.organizationId), state.schoolId).years),
  setGovernanceLevel(governanceLevel: FrontendGovernanceLevel): void {
    state.governanceLevel = governanceLevel;
    if (governanceLevel === 'PLATEFORME') {
      viderContexteOrganisationEtEcole();
    } else if (governanceLevel === 'ORGANISATION') {
      viderContexteEcole();
    }
  },
  ensureAllowedLevel(levels: readonly FrontendGovernanceLevel[]): void {
    if (levels.includes(state.governanceLevel)) {
      return;
    }

    state.governanceLevel = levels[0] ?? 'ECOLE';
    if (state.governanceLevel === 'PLATEFORME') {
      viderContexteOrganisationEtEcole();
    } else if (state.governanceLevel === 'ORGANISATION') {
      viderContexteEcole();
    }
  },
  setOrganization(organizationId: string): void {
    const organization = findOrganization(organizationId);
    appliquerOrganisationAuContexte(organization);
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
  },
  setSchoolYear(schoolYearLabelOrId: string, schoolYearId?: string): void {
    const school = findSchool(findOrganization(state.organizationId), state.schoolId);
    const schoolYear = schoolYearId
      ? school.years.find((year) => year.id === schoolYearId) ?? resolveSchoolYear(school, schoolYearLabelOrId)
      : resolveSchoolYear(school, schoolYearLabelOrId);
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label;
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
    }
  },
  remplacerOrganisationsDepuisBackend(
    organisations: ReadonlyArray<{
      id: string;
      nom: string;
    }>,
  ): void {
    const organisationsReelles = organisations.map((organisation) => {
      const existante = organizationsState.find((candidate) => candidate.id === organisation.id);
      return {
        id: organisation.id,
        name: organisation.nom,
        schools: existante?.schools ?? [],
      } satisfies OrganizationContextOption;
    });

    organizationsState.splice(0, organizationsState.length, ...organisationsReelles);

    const organisationActive = organisationsReelles.find(
      (organisation) => organisation.id === state.organizationId,
    );
    if (organisationActive) {
      state.organizationName = organisationActive.name;
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

    if (state.organizationId === organizationId && state.schoolId) {
      const ecoleActive = findOrganization(organizationId).schools.find(
        (ecole) => ecole.id === state.schoolId,
      );
      if (ecoleActive) {
        state.schoolName = ecoleActive.name;
        state.sectionName = ecoleActive.sectionName;
        const anneeActive = ecoleActive.years.find((annee) => annee.id === state.schoolYearId);
        if (anneeActive) state.schoolYearLabel = anneeActive.label;
      }
    }
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
      sectionName: index >= 0 ? ecoles[index].sectionName : '',
      years: index >= 0 ? ecoles[index].years : [],
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
    if (params.organizationId === null) {
      viderContexteOrganisationEtEcole();
      return;
    }

    const organizationId = params.organizationId ?? state.organizationId;
    const organization = findOrganization(organizationId);
    state.organizationId = organization.id;
    state.organizationName = organization.name;

    if (params.schoolId === null || (!params.schoolId && !state.schoolId)) {
      viderContexteEcole();
      return;
    }

    const schoolId = params.schoolId ?? state.schoolId;
    const school = findSchool(organization, schoolId);
    const schoolYear = getFirstSchoolYear(school);
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearId = schoolYear.id;
    state.schoolYearLabel = schoolYear.label || state.schoolYearLabel;
  },
  clear(): void {
    organizationsState.splice(0, organizationsState.length);
    state.governanceLevel = 'PLATEFORME';
    viderContexteOrganisationEtEcole();
  },
};
