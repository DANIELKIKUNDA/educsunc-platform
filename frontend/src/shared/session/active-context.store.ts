import { reactive } from 'vue';

export interface ActiveFrontendContext {
  organizationName: string;
  schoolName: string;
  sectionName: string;
  schoolYearLabel: string;
}

const state = reactive<ActiveFrontendContext>({
  organizationName: 'Archi Logiciel Education',
  schoolName: 'College Saint Raphael',
  sectionName: 'Secondaire',
  schoolYearLabel: '2025 - 2026',
});

export const activeContextStore = {
  state,
  setSchoolName(schoolName: string): void {
    state.schoolName = schoolName;
  },
  setSchoolYear(schoolYearLabel: string): void {
    state.schoolYearLabel = schoolYearLabel;
  },
};
