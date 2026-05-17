// Ce fichier decrit le schema logique de la table des operations offline du BC.
export const OfflineOperationSchema = {
  table: 'offline_operations_bulletins',
  colonnes: ['id', 'type_operation', 'charge_utile', 'date_enregistrement', 'statut'],
} as const;
