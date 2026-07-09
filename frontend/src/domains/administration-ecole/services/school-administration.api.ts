import { clientApi } from '../../../services/api';
import {
  construireEntetesPilotageActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type {
  CreateSchoolPayload,
  DetailResponse,
  ListResponse,
  SchoolAdministrationItem,
  SchoolAdministrationOrganizationItem,
  SchoolInstitutionalInfoPayload,
} from '../models/school-administration.model';

function buildQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim().length > 0) {
      params.set(key, String(value));
    }
  });

  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
}

function generateIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildReadHeaders() {
  const context = lireContexteApiActif();
  return construireEntetesPilotageActif(context);
}

function buildMutationHeaders(prefix: string) {
  return {
    ...buildReadHeaders(),
    'idempotency-key': generateIdempotencyKey(prefix),
  };
}

export const schoolAdministrationApi = {
  async listOrganizations(page = 1, taillePage = 100) {
    return clientApi.envoyer<ListResponse<SchoolAdministrationOrganizationItem>>({
      chemin: `/api/organisations${buildQueryString({ page, taillePage })}`,
      entetes: buildReadHeaders(),
    });
  },

  async listSchoolsByOrganization(idOrganisation: string, page = 1, taillePage = 50) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<ListResponse<SchoolAdministrationItem>>({
      chemin: `/api/organisations/${idOrganisation}/ecoles${buildQueryString({ page, taillePage })}`,
      entetes: construireEntetesPilotageActif(context, {
        organisationId: idOrganisation,
        lectureOrganisationnelle: true,
      }),
    });
  },

  async getSchool(idEcole: string) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}`,
      entetes: construireEntetesPilotageActif(context, { ecoleId: idEcole }),
    });
  },

  async createSchool(payload: CreateSchoolPayload) {
    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: '/api/ecoles',
      methode: 'POST',
      corps: payload,
      entetes: buildMutationHeaders('adm-school-create'),
    });
  },

  async renameSchool(idEcole: string, nouveauNom: string) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}/renommer`,
      methode: 'PATCH',
      corps: { nouveauNom },
      entetes: {
        ...construireEntetesPilotageActif(context, { ecoleId: idEcole }),
        'idempotency-key': generateIdempotencyKey('adm-school-rename'),
      },
    });
  },

  async changeSchoolMode(idEcole: string, nouveauModeExploitation: string) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}/changer-mode`,
      methode: 'POST',
      corps: { nouveauModeExploitation },
      entetes: {
        ...construireEntetesPilotageActif(context, { ecoleId: idEcole }),
        'idempotency-key': generateIdempotencyKey('adm-school-mode'),
      },
    });
  },

  async updateSchoolInstitutionalInfo(
    idEcole: string,
    payload: SchoolInstitutionalInfoPayload,
  ) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}/informations-institutionnelles`,
      methode: 'PATCH',
      corps: payload,
      entetes: {
        ...construireEntetesPilotageActif(context, { ecoleId: idEcole }),
        'idempotency-key': generateIdempotencyKey('adm-school-identity'),
      },
    });
  },

  async activateSchool(idEcole: string) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}/activer`,
      methode: 'POST',
      corps: {},
      entetes: {
        ...construireEntetesPilotageActif(context, { ecoleId: idEcole }),
        'idempotency-key': generateIdempotencyKey('adm-school-activate'),
      },
    });
  },

  async deactivateSchool(idEcole: string) {
    const context = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<SchoolAdministrationItem>>({
      chemin: `/api/ecoles/${idEcole}/desactiver`,
      methode: 'POST',
      corps: {},
      entetes: {
        ...construireEntetesPilotageActif(context, { ecoleId: idEcole }),
        'idempotency-key': generateIdempotencyKey('adm-school-deactivate'),
      },
    });
  },
};

