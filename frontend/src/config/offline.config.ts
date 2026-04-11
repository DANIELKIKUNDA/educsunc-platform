import { MODES_APPLICATION, type ModeApplication } from '../offline/config/mode';

// Regroupe les reglages frontend pour le mode hybride offline/sync.
export const configurationOffline: {
  modeParDefaut: ModeApplication;
  modesSupportes: ModeApplication[];
} = {
  modeParDefaut: MODES_APPLICATION.SYNC,
  modesSupportes: [
    MODES_APPLICATION.OFFLINE_ONLY,
    MODES_APPLICATION.SYNC,
    MODES_APPLICATION.MIGRATION,
  ],
};
