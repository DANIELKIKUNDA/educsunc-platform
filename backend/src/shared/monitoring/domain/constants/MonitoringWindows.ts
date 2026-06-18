// Ce fichier declare les fenetres temporelles metier du module Monitoring.

/** Cette constante centralise les fenetres de calcul recurrentes. */
export const MONITORING_WINDOWS = {
  instantane: 5 * 60 * 1000,
  courtTerme: 15 * 60 * 1000,
  moyenTerme: 60 * 60 * 1000,
  longTerme: 24 * 60 * 60 * 1000,
} as const;
