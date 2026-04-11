// Definit les modes de fonctionnement hybrides du frontend.
export const MODES_APPLICATION = {
  OFFLINE_ONLY: 'OFFLINE_ONLY',
  SYNC: 'SYNC',
  MIGRATION: 'MIGRATION',
} as const;

export type ModeApplication = (typeof MODES_APPLICATION)[keyof typeof MODES_APPLICATION];
