import {
  DefinitionColonnePostgres,
  SchemaTablePostgres,
  creerSchemaTablePostgres,
} from './SchemaPostgres';

// Cette fonction cree la colonne d'identifiant primaire standard.
function creerColonneIdentifiant(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'id',
    type: 'uuid',
    obligatoire: true,
    commentaire,
  };
}

// Cette fonction cree la colonne de creation technique standard.
function creerColonneCreeLe(commentaire: string): DefinitionColonnePostgres {
  return {
    nom: 'cree_le',
    type: 'timestamptz',
    obligatoire: true,
    valeurParDefautSql: 'CURRENT_TIMESTAMP',
    commentaire,
  };
}

// Ce schema decrit la table technique d'idempotence des operations sensibles.
export const schemaTableIdempotencyKeys: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'idempotency_keys',
  categorie: 'technique_associee',
  description: "Table technique des cles d'idempotence du BC.",
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de la cle d'idempotence."),
    {
      nom: 'cle',
      type: 'varchar',
      taille: 255,
      obligatoire: true,
      commentaire: "Cle d'idempotence fournie par le client.",
    },
    {
      nom: 'operation',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Nom logique de l operation protegee.',
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Statut technique de la cle d'idempotence.",
    },
    {
      nom: 'empreinte_requete',
      type: 'varchar',
      taille: 255,
      obligatoire: false,
      commentaire: 'Empreinte de la requete associee.',
    },
    {
      nom: 'resultat',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Resultat technique memorise si disponible.',
    },
    {
      nom: 'expire_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: "Date d'expiration de la cle.",
    },
    creerColonneCreeLe("Date d'enregistrement de la cle d'idempotence."),
  ],
  references: [],
  index: [
    {
      nom: 'ux_idempotency_keys_cle',
      colonnes: ['cle'],
      unique: true,
      commentaire: "Garantit l'unicite de la cle d'idempotence.",
    },
    {
      nom: 'ix_idempotency_keys_expire_le',
      colonnes: ['expire_le'],
      unique: false,
      commentaire: 'Accelere le nettoyage des cles expirees.',
    },
  ],
});

// Ce schema decrit la table technique de journalisation de synchronisation.
export const schemaTableSyncLogs: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'sync_logs',
  categorie: 'technique_associee',
  description: 'Table technique des journaux de synchronisation transverse.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant('Identifiant technique du journal de synchronisation.'),
    {
      nom: 'operation',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: 'Nom logique de l operation de synchronisation.',
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: 'Statut technique du journal de synchronisation.',
    },
    {
      nom: 'contexte',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Contexte technique capture au debut.',
    },
    {
      nom: 'resultat',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Resultat technique capture en succes.',
    },
    {
      nom: 'erreur',
      type: 'text',
      obligatoire: false,
      commentaire: "Message d'erreur capture en echec.",
    },
    {
      nom: 'details_erreur',
      type: 'jsonb',
      obligatoire: false,
      commentaire: "Details techniques de l'echec si disponibles.",
    },
    {
      nom: 'termine_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: 'Date de fin du journal.',
    },
    creerColonneCreeLe('Date de debut du journal de synchronisation.'),
  ],
  references: [],
  index: [
    {
      nom: 'ix_sync_logs_operation',
      colonnes: ['operation'],
      unique: false,
      commentaire: 'Accelere les lectures par operation.',
    },
    {
      nom: 'ix_sync_logs_statut',
      colonnes: ['statut'],
      unique: false,
      commentaire: 'Accelere les lectures par statut.',
    },
    {
      nom: 'ix_sync_logs_cree_le',
      colonnes: ['cree_le'],
      unique: false,
      commentaire: 'Accelere les lectures chronologiques.',
    },
  ],
});

// Ce schema decrit la table technique des journaux d'audit.
export const schemaTableAuditLogs: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'audit_logs',
  categorie: 'technique_associee',
  description: "Table technique de tracabilite des actions critiques du BC.",
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique de l'entree d'audit."),
    {
      nom: 'action',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: 'Action fonctionnelle ou technique journalisee.',
    },
    {
      nom: 'acteur',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: "Acteur ayant declenche l'action.",
    },
    {
      nom: 'type_ressource',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Type de ressource concernee.',
    },
    {
      nom: 'id_ressource',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: 'Identifiant metier ou technique de la ressource.',
    },
    {
      nom: 'id_ecole',
      type: 'uuid',
      obligatoire: false,
      commentaire: 'Ecole concernee par l action si applicable.',
    },
    {
      nom: 'id_organisation',
      type: 'uuid',
      obligatoire: false,
      commentaire: "Organisation concernee par l'action si applicable.",
    },
    {
      nom: 'details',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Details techniques ou metiers journalises.',
    },
    creerColonneCreeLe("Date de creation de l'entree d'audit."),
  ],
  references: [
    {
      colonneLocale: 'id_ecole',
      tableReferencee: 'ecoles',
      colonneReferencee: 'id',
      actionSuppression: 'set_null',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference optionnelle vers une ecole.',
    },
    {
      colonneLocale: 'id_organisation',
      tableReferencee: 'organisations',
      colonneReferencee: 'id',
      actionSuppression: 'set_null',
      actionMiseAJour: 'cascade',
      commentaire: 'Reference optionnelle vers une organisation.',
    },
  ],
  index: [
    {
      nom: 'ix_audit_logs_action',
      colonnes: ['action'],
      unique: false,
      commentaire: 'Accelere les lectures par action.',
    },
    {
      nom: 'ix_audit_logs_ecole',
      colonnes: ['id_ecole'],
      unique: false,
      commentaire: 'Accelere les lectures par ecole.',
    },
    {
      nom: 'ix_audit_logs_organisation',
      colonnes: ['id_organisation'],
      unique: false,
      commentaire: 'Accelere les lectures par organisation.',
    },
    {
      nom: 'ix_audit_logs_cree_le',
      colonnes: ['cree_le'],
      unique: false,
      commentaire: 'Accelere les lectures chronologiques.',
    },
  ],
});

// Ce schema decrit la table technique des journaux d'import de referentiel.
export const schemaTableImportReferentielLogs: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'import_referentiel_logs',
  categorie: 'technique_associee',
  description: 'Table technique des imports controles de referentiel.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique du journal d'import."),
    {
      nom: 'type_import',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: "Type logique d'import realise.",
    },
    {
      nom: 'source',
      type: 'varchar',
      taille: 255,
      obligatoire: false,
      commentaire: "Source du fichier ou du flux d'import.",
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Statut technique de l'import.",
    },
    {
      nom: 'resume',
      type: 'text',
      obligatoire: false,
      commentaire: "Resume lisible de l'import.",
    },
    {
      nom: 'resultat',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Resultat technique ou compte rendu d import.',
    },
    {
      nom: 'erreur',
      type: 'text',
      obligatoire: false,
      commentaire: "Erreur capturee pendant l'import si applicable.",
    },
    {
      nom: 'importe_par',
      type: 'varchar',
      taille: 120,
      obligatoire: false,
      commentaire: "Acteur ayant declenche l'import.",
    },
    creerColonneCreeLe("Date de demarrage de l'import."),
  ],
  references: [],
  index: [
    {
      nom: 'ix_import_referentiel_logs_type_import',
      colonnes: ['type_import'],
      unique: false,
      commentaire: 'Accelere les lectures par type import.',
    },
    {
      nom: 'ix_import_referentiel_logs_statut',
      colonnes: ['statut'],
      unique: false,
      commentaire: 'Accelere les lectures par statut.',
    },
    {
      nom: 'ix_import_referentiel_logs_cree_le',
      colonnes: ['cree_le'],
      unique: false,
      commentaire: 'Accelere les lectures chronologiques.',
    },
  ],
});

// Ce schema decrit la table technique de journalisation des jobs asynchrones.
export const schemaTableJobsLogs: SchemaTablePostgres = creerSchemaTablePostgres({
  nomTable: 'jobs_logs',
  categorie: 'technique_associee',
  description: 'Table technique des executions de jobs asynchrones du BC.',
  strategieIsolationTenant: 'non_applicable',
  clePrimaire: ['id'],
  colonnes: [
    creerColonneIdentifiant("Identifiant technique du journal de job."),
    {
      nom: 'nom_job',
      type: 'varchar',
      taille: 120,
      obligatoire: true,
      commentaire: 'Nom du job execute.',
    },
    {
      nom: 'statut',
      type: 'varchar',
      taille: 40,
      obligatoire: true,
      commentaire: "Statut technique du job.",
    },
    {
      nom: 'charge',
      type: 'jsonb',
      obligatoire: false,
      commentaire: 'Charge technique traitee par le job.',
    },
    {
      nom: 'resultat',
      type: 'jsonb',
      obligatoire: false,
      commentaire: "Resultat technique du job s'il existe.",
    },
    {
      nom: 'erreur',
      type: 'text',
      obligatoire: false,
      commentaire: "Erreur capturee pendant l'execution.",
    },
    {
      nom: 'termine_le',
      type: 'timestamptz',
      obligatoire: false,
      commentaire: 'Date de fin du job.',
    },
    creerColonneCreeLe('Date de demarrage du job.'),
  ],
  references: [],
  index: [
    {
      nom: 'ix_jobs_logs_nom_job',
      colonnes: ['nom_job'],
      unique: false,
      commentaire: 'Accelere les lectures par nom de job.',
    },
    {
      nom: 'ix_jobs_logs_statut',
      colonnes: ['statut'],
      unique: false,
      commentaire: 'Accelere les lectures par statut.',
    },
    {
      nom: 'ix_jobs_logs_cree_le',
      colonnes: ['cree_le'],
      unique: false,
      commentaire: 'Accelere les lectures chronologiques.',
    },
  ],
});

// Cette collection regroupe les tables techniques associees du BC decrites dans les documents.
export const schemasTablesTechniquesAssocieesReferentielAcademique:
readonly SchemaTablePostgres[] = [
  schemaTableIdempotencyKeys,
  schemaTableSyncLogs,
  schemaTableAuditLogs,
  schemaTableImportReferentielLogs,
  schemaTableJobsLogs,
];
