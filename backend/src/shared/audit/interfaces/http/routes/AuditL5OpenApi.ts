const erreurL5 = {
  type: 'object',
  description: 'Erreur HTTP normalisee sans detail technique.',
  additionalProperties: true,
};

const erreursL5 = {
  400: erreurL5,
  401: erreurL5,
  403: erreurL5,
  404: erreurL5,
  409: erreurL5,
  429: erreurL5,
  500: erreurL5,
};

const reponseL5 = {
  type: 'object',
  additionalProperties: true,
};

const paramsId = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1, maxLength: 160 } },
};

const bodyExport = {
  type: 'object',
  additionalProperties: true,
  required: ['format'],
  properties: {
    format: { type: 'string', enum: ['CSV', 'JSON', 'PDF'] },
    dateDebut: { type: 'string', format: 'date-time' },
    dateFin: { type: 'string', format: 'date-time' },
    action: { type: 'string', maxLength: 160 },
    gravite: { type: 'string', maxLength: 80 },
    resultat: { type: 'string', maxLength: 80 },
    acteurId: { type: 'string', maxLength: 160 },
    ressourceId: { type: 'string', maxLength: 160 },
    correlationId: { type: 'string', maxLength: 160 },
  },
};

export const auditExportCreateOpenApi = {
  tags: ['Audit'],
  summary: 'Demander un export Audit asynchrone',
  description: 'Le perimetre vient de la session authentifiee. Permission audit.export et limites anti-abus actives.',
  headers: {
    type: 'object',
    properties: { 'idempotency-key': { type: 'string', minLength: 8, maxLength: 160 } },
  },
  body: bodyExport,
  response: { 202: reponseL5, ...erreursL5 },
};

export const auditExportStatusOpenApi = {
  tags: ['Audit'],
  summary: "Consulter l'etat d'un export Audit",
  description: 'Permission audit.export.read. Le demandeur et le perimetre authentifie sont verifies.',
  params: paramsId,
  response: { 200: reponseL5, ...erreursL5 },
};

export const auditExportDownloadOpenApi = {
  tags: ['Audit'],
  summary: 'Telecharger un export Audit termine',
  description: 'Permission audit.export.download. Fichier prive, temporaire et controle par le serveur.',
  params: paramsId,
  response: { 200: {}, ...erreursL5 },
};

export const auditExportDeleteOpenApi = {
  tags: ['Audit'],
  summary: 'Supprimer un fichier exporte',
  description: "Permission audit.export.delete. L'evenement Audit canonique n'est jamais supprime.",
  params: paramsId,
  response: { 200: reponseL5, ...erreursL5 },
};

const bodyReplay = {
  type: 'object',
  additionalProperties: false,
  required: ['raison'],
  properties: {
    replayId: { type: 'string', maxLength: 160 },
    mode: { type: 'string', enum: ['DRY_RUN', 'EXECUTE'], default: 'DRY_RUN' },
    raison: { type: 'string', minLength: 10, maxLength: 500 },
    limite: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
    profondeur: { type: 'integer', minimum: 1, maximum: 100000 },
    correlationId: { type: 'string', maxLength: 160 },
  },
};

export const auditReplayOpenApi = {
  tags: ['Audit'],
  summary: 'Reconstruire une projection Audit',
  description: 'Permission audit.replay. Replay borne, idempotent et limite aux projections explicitement supportees.',
  body: bodyReplay,
  response: { 202: reponseL5, ...erreursL5 },
};

const bodyRetention = {
  type: 'object',
  additionalProperties: true,
  required: ['dateFin'],
  properties: {
    dateFin: { type: 'string', format: 'date-time' },
    raison: { type: 'string', minLength: 10, maxLength: 500 },
  },
};

export const auditRetentionArchiveOpenApi = {
  tags: ['Audit'],
  summary: 'Archiver logiquement des evenements Audit',
  description: 'Permission audit.retention.archive. Traitement borne et non destructif; aucune purge physique.',
  body: bodyRetention,
  response: { 202: reponseL5, ...erreursL5 },
};

export const auditRetentionPreviewOpenApi = {
  tags: ['Audit'],
  summary: 'Previsualiser une retention Audit',
  description: 'Permission audit.retention.purge. Apercu uniquement; aucune suppression physique automatique.',
  body: bodyRetention,
  response: { 202: reponseL5, ...erreursL5 },
};

export const auditRetentionStatusOpenApi = {
  tags: ['Audit'],
  summary: 'Consulter les archives Audit',
  description: 'Permission audit.retention.read. Lecture bornee par le perimetre authentifie.',
  response: { 200: reponseL5, ...erreursL5 },
};

export const auditIntegrityEntryOpenApi = {
  tags: ['Audit'],
  summary: "Verifier l'integrite d'un evenement Audit",
  description: 'Permission audit.security.read. Verification SHA-256 sans mutation de la source canonique.',
  params: paramsId,
  response: { 200: reponseL5, ...erreursL5 },
};

export const auditIntegrityRangeOpenApi = {
  tags: ['Audit'],
  summary: "Verifier l'integrite d'une plage Audit",
  description: 'Permission audit.security.read. Verification administrative bornee a 1000 evenements.',
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      dateDebut: { type: 'string', format: 'date-time' },
      dateFin: { type: 'string', format: 'date-time' },
      limite: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
      organisationId: { type: 'string', maxLength: 160, description: 'Filtre plateforme uniquement.' },
      ecoleId: { type: 'string', maxLength: 160, description: 'Filtre plateforme uniquement.' },
    },
  },
  response: { 202: reponseL5, ...erreursL5 },
};
