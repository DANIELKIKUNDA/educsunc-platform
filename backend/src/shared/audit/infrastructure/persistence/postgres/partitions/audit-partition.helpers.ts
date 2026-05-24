import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

// Le document impose une convention mensuelle stable pour les partitions Audit.
export function construireNomPartitionMensuelle(tableParent: string, annee: number, mois: number): string {
  return `${tableParent}_${annee}_${pad2(mois)}`;
}

export interface AuditPartitionWindow {
  readonly nomPartition: string;
  readonly debut: string;
  readonly finExclusive: string;
}

// Cette aide calcule la fenetre officielle RANGE mensuelle a partir de la date source.
export function calculerFenetrePartitionMensuelle(
  definition: AuditPostgresPartitionDefinition,
  dateSource: Date,
): AuditPartitionWindow {
  const annee = dateSource.getUTCFullYear();
  const mois = dateSource.getUTCMonth() + 1;
  const prochainMois = mois === 12 ? 1 : mois + 1;
  const prochaineAnnee = mois === 12 ? annee + 1 : annee;
  return {
    nomPartition: construireNomPartitionMensuelle(definition.tableParent, annee, mois),
    debut: `${annee}-${pad2(mois)}-01T00:00:00.000Z`,
    finExclusive: `${prochaineAnnee}-${pad2(prochainMois)}-01T00:00:00.000Z`,
  };
}

// La V1 impose des bornes temporelles pour rester partition-friendly.
export function requiertBornesTemporelles(definition: AuditPostgresPartitionDefinition): boolean {
  return definition.queryRules.some((rule) => rule.obligation.includes('borne temporelle'));
}

