// Cette taxonomie officielle liste les ressources observables par l'audit.
export const TYPE_RESSOURCE_AUDIT_ENUM = [
  'UTILISATEUR',
  'ROLE',
  'PERMISSION',
  'ELEVE',
  'INSCRIPTION',
  'PAIEMENT',
  'RECU',
  'CAISSE',
  'FICHE_COTATION',
  'COTE',
  'BULLETIN',
  'PROCLAMATION',
  'CLASSE',
  'COURS',
  'REFERENTIEL',
  'ORGANISATION',
  'ECOLE',
  'NOTIFICATION',
  'CONFIGURATION',
  'AUDIT',
] as const;

export type TypeRessourceAuditEnum = (typeof TYPE_RESSOURCE_AUDIT_ENUM)[number];
