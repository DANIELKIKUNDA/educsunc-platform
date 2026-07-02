import { computed, reactive } from 'vue';
import type { FrontendGovernanceLevel } from '../auth/session.store';

interface SchoolContextOption {
  id: string;
  name: string;
  sectionName: string;
  years: readonly string[];
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
  schoolYearLabel: string;
}

const organizations: readonly OrganizationContextOption[] = [
  {
    id: 'org-archedu',
    name: 'Archi Logiciel Education',
    schools: [
      {
        id: 'ecole-saint-raphael',
        name: 'College Saint Raphael',
        sectionName: 'Secondaire',
        years: ['2025 - 2026', '2024 - 2025'],
      },
      {
        id: 'ecole-sainte-marie',
        name: 'Ecole Sainte Marie',
        sectionName: 'Primaire',
        years: ['2025 - 2026', '2024 - 2025'],
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
        years: ['2025 - 2026', '2024 - 2025'],
      },
    ],
  },
];

function findOrganization(organizationId: string): OrganizationContextOption {
  return organizations.find((organization) => organization.id === organizationId) ?? organizations[0];
}

function findSchool(organization: OrganizationContextOption, schoolId: string): SchoolContextOption {
  return organization.schools.find((school) => school.id === schoolId) ?? organization.schools[0];
}

const initialOrganization = organizations[0];
const initialSchool = initialOrganization.schools[0];

const state = reactive<ActiveFrontendContext>({
  governanceLevel: 'ECOLE',
  organizationId: initialOrganization.id,
  organizationName: initialOrganization.name,
  schoolId: initialSchool.id,
  schoolName: initialSchool.name,
  sectionName: initialSchool.sectionName,
  schoolYearLabel: initialSchool.years[0],
});

export const activeContextStore = {
  state,
  organizations,
  organizationOptions: computed(() => organizations),
  schoolOptions: computed(() => findOrganization(state.organizationId).schools),
  schoolYearOptions: computed(() => findSchool(findOrganization(state.organizationId), state.schoolId).years),
  setGovernanceLevel(governanceLevel: FrontendGovernanceLevel): void {
    state.governanceLevel = governanceLevel;
  },
  ensureAllowedLevel(levels: readonly FrontendGovernanceLevel[]): void {
    if (levels.includes(state.governanceLevel)) {
      return;
    }

    state.governanceLevel = levels[0] ?? 'ECOLE';
  },
  setOrganization(organizationId: string): void {
    const organization = findOrganization(organizationId);
    const school = organization.schools[0];
    state.organizationId = organization.id;
    state.organizationName = organization.name;
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearLabel = school.years[0];
  },
  setSchool(schoolId: string): void {
    const organization = findOrganization(state.organizationId);
    const school = findSchool(organization, schoolId);
    state.schoolId = school.id;
    state.schoolName = school.name;
    state.sectionName = school.sectionName;
    state.schoolYearLabel = school.years[0];
  },
  setSchoolYear(schoolYearLabel: string): void {
    state.schoolYearLabel = schoolYearLabel;
  },
};
