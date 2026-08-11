const erreur = {
  type: 'object',
  description: 'Erreur HTTP normalisee sans detail technique.',
  additionalProperties: true,
};

const queryLecture = {
  type: 'object',
  additionalProperties: true,
  properties: {
    taillePage: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    cursor: { type: 'string', maxLength: 1024, description: 'Curseur opaque retourne par la page precedente.' },
    action: { type: 'string' },
    typeAuditPrincipal: { type: 'string' },
    categorieAudit: { type: 'string' },
    gravite: { type: 'string' },
    resultat: { type: 'string' },
    acteurId: { type: 'string' },
    typeRessource: { type: 'string' },
    ressourceId: { type: 'string' },
    correlationId: { type: 'string' },
    requestId: { type: 'string' },
    sourceAudit: { type: 'string' },
    dateDebut: { type: 'string', format: 'date-time' },
    dateFin: { type: 'string', format: 'date-time' },
    organisationId: { type: 'string', description: 'Filtre plateforme uniquement; le tenant authentifie reste prioritaire.' },
    ecoleId: { type: 'string', description: 'Filtre plateforme uniquement; le tenant authentifie reste prioritaire.' },
  },
};

const reponseLecture = {
  type: 'object',
  additionalProperties: true,
  properties: {
    donnee: {
      type: 'object',
      additionalProperties: true,
      properties: {
        items: { type: 'array', items: { type: 'object', additionalProperties: true } },
        nextCursor: { type: 'string' },
        hasNextPage: { type: 'boolean' },
      },
    },
    meta: { type: 'object', additionalProperties: true },
  },
};

const erreursLecture = { 400: erreur, 401: erreur, 403: erreur, 500: erreur };

export const auditListOpenApi = {
  tags: ['Audit'],
  summary: 'Rechercher les evenements Audit',
  description: 'Permission audit.read. Pagination keyset stable, filtres SQL parametres et perimetre tenant authentifie.',
  querystring: queryLecture,
  response: { 200: reponseLecture, ...erreursLecture },
};

export const auditDetailOpenApi = {
  tags: ['Audit'],
  summary: 'Consulter un evenement Audit',
  description: 'Permission audit.read. Le perimetre tenant est applique avant la recherche par identifiant.',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', minLength: 1 } },
  },
  querystring: queryLecture,
  response: { 200: { type: 'object', additionalProperties: true }, 404: erreur, ...erreursLecture },
};

export const auditTimelineOpenApi = {
  tags: ['Audit'],
  summary: 'Consulter une chronologie Audit',
  description: 'Permission audit.timeline.read. La chronologie utilise la meme pagination keyset que le journal principal.',
  querystring: queryLecture,
  response: { 200: reponseLecture, ...erreursLecture },
};

export const auditHistoryOpenApi = {
  tags: ['Audit'],
  summary: "Consulter l'historique d'un acteur ou d'une ressource",
  description: 'Permission audit.history.read. Lecture PostgreSQL bornee par le tenant authentifie.',
  querystring: queryLecture,
  response: { 200: reponseLecture, ...erreursLecture },
};
