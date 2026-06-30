import { reactive } from 'vue';
import type {
  ClasseAcademiqueItem,
  OptionEtudeItem,
  ReferentielProgrammeItem,
  SectionScolaireItem,
} from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';
import {
  mapperClassesAcademiques,
  mapperOptionsEtudes,
  mapperReferentielsProgrammes,
  mapperSectionsScolaires,
} from '../mappers/academique-referentiels.mapper';

interface AcademiqueReferentielsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  sections: SectionScolaireItem[];
  classesAcademiques: ClasseAcademiqueItem[];
  optionsEtudes: OptionEtudeItem[];
  referentiels: ReferentielProgrammeItem[];
  detailReferentiel: ReferentielProgrammeItem | null;
}

const state = reactive<AcademiqueReferentielsState>({
  status: 'idle',
  errorMessage: null,
  sections: [],
  classesAcademiques: [],
  optionsEtudes: [],
  referentiels: [],
  detailReferentiel: null,
});

async function executer(action: () => Promise<void>, fallbackMessage: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    await action();
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
  }
}

async function chargerSocle(): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const [sectionsResponse, classesResponse, optionsResponse] = await Promise.all([
      academiqueApi.listerSectionsScolaires(contexte),
      academiqueApi.listerClassesAcademiques(contexte),
      academiqueApi.listerOptionsEtudes(contexte),
    ]);

    state.sections = mapperSectionsScolaires(sectionsResponse.donnees);
    state.classesAcademiques = mapperClassesAcademiques(classesResponse.donnees);
    state.optionsEtudes = mapperOptionsEtudes(optionsResponse.donnees);
  }, 'La lecture du socle academique a echoue.');
}

async function chargerReferentiels(idClasseAcademique: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.listerReferentielsProgrammes(idClasseAcademique, contexte);
    state.referentiels = mapperReferentielsProgrammes(response.donnees);
  }, 'La lecture des referentiels programmes a echoue.');
}

async function chargerDetail(idReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterReferentielProgramme(idReferentielProgramme, contexte);
    state.detailReferentiel = response.donnee;
  }, 'Le detail du referentiel est indisponible.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.sections = [];
  state.classesAcademiques = [];
  state.optionsEtudes = [];
  state.referentiels = [];
  state.detailReferentiel = null;
}

export function useAcademiqueReferentielsStore() {
  return {
    state,
    chargerSocle,
    chargerReferentiels,
    chargerDetail,
    reinitialiser,
  };
}
