export type ConfigurationRetentionMonitoring = {
  readonly diagnosticsJours: number | null;
  readonly tracesJours: number | null;
};

function lireDureeOptionnelle(valeur: string | undefined, nom: string): number | null {
  if (valeur === undefined || valeur.trim() === '') return null;
  const jours = Number(valeur);
  if (!Number.isInteger(jours) || jours <= 0 || jours > 3650) {
    throw new Error(`${nom} doit etre un entier compris entre 1 et 3650 jours.`);
  }
  return jours;
}

/**
 * M10: aucune duree n'est inventee. En l'absence de configuration explicite,
 * diagnostics et traces ne sont pas purges automatiquement.
 */
export function chargerPolitiqueRetentionMonitoring(
  env: NodeJS.ProcessEnv = process.env,
): ConfigurationRetentionMonitoring {
  return {
    diagnosticsJours: lireDureeOptionnelle(env.MONITORING_RETENTION_DIAGNOSTICS_DAYS, 'MONITORING_RETENTION_DIAGNOSTICS_DAYS'),
    tracesJours: lireDureeOptionnelle(env.MONITORING_RETENTION_TRACES_DAYS, 'MONITORING_RETENTION_TRACES_DAYS'),
  };
}
