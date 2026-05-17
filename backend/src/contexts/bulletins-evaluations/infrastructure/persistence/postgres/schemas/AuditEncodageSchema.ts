// Ce fichier decrit le schema logique de la table d'audit d'encodage des cotes.
export const AuditEncodageSchema = {
  table: 'audit_encodage_bulletins',
  colonnes: ['id', 'id_fiche_cotation', 'action', 'date_action', 'id_utilisateur', 'commentaire'],
} as const;
