import { clientApi } from '../../../services/api';
import {
  construireEntetesPilotageActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type {
  CreerEcolePayload,
  CreerOrganisationPayload,
  DetailResponse,
  EcoleItem,
  OrganisationHistoryItem,
  InformationsInstitutionnellesPayload,
  ListResponse,
  MettreAJourOrganisationPayload,
  OrganisationIndicatorsItem,
  OrganisationItem,
} from '../models/organization-governance.model';

function construireQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur !== undefined && String(valeur).trim().length > 0) {
      params.set(cle, String(valeur));
    }
  });

  const serialise = params.toString();
  return serialise.length > 0 ? `?${serialise}` : '';
}

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesLecture() {
  const contexte = lireContexteApiActif();

  return construireEntetesPilotageActif(contexte);
}

function construireEntetesMutation(prefixe: string) {
  return {
    ...construireEntetesLecture(),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export const organizationGovernanceApi = {
  async listerOrganisations(page = 1, taillePage = 20) {
    return clientApi.envoyer<ListResponse<OrganisationItem>>({
      chemin: `/api/organisations${construireQueryString({ page, taillePage })}`,
      entetes: construireEntetesLecture(),
    });
  },

  async consulterOrganisation(idOrganisation: string) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: `/api/organisations/${idOrganisation}`,
      entetes: construireEntetesLecture(),
    });
  },

  async consulterIndicateursOrganisation(idOrganisation: string) {
    return clientApi.envoyer<DetailResponse<OrganisationIndicatorsItem>>({
      chemin: `/api/organisations/${idOrganisation}/indicateurs`,
      entetes: construireEntetesLecture(),
    });
  },

  async consulterHistoriqueOrganisation(idOrganisation: string) {
    return clientApi.envoyer<DetailResponse<{ evenements: readonly OrganisationHistoryItem[] }>>({
      chemin: `/api/organisations/${idOrganisation}/historique`,
      entetes: construireEntetesLecture(),
    });
  },

  async creerOrganisation(payload: CreerOrganisationPayload) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: '/api/organisations',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation('organisation-create'),
    });
  },

  async renommerOrganisation(idOrganisation: string, nouveauNom: string) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: `/api/organisations/${idOrganisation}/renommer`,
      methode: 'PATCH',
      corps: { nouveauNom },
      entetes: construireEntetesMutation('organisation-rename'),
    });
  },

  async mettreAJourOrganisation(idOrganisation: string, payload: MettreAJourOrganisationPayload) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: `/api/organisations/${idOrganisation}`,
      methode: 'PATCH',
      corps: payload,
      entetes: construireEntetesMutation('organisation-update'),
    });
  },

  async activerOrganisation(idOrganisation: string) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: `/api/organisations/${idOrganisation}/activer`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutation('organisation-activate'),
    });
  },

  async desactiverOrganisation(idOrganisation: string) {
    return clientApi.envoyer<DetailResponse<OrganisationItem>>({
      chemin: `/api/organisations/${idOrganisation}/desactiver`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutation('organisation-deactivate'),
    });
  },

  async listerEcolesParOrganisation(idOrganisation: string, page = 1, taillePage = 20) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<ListResponse<EcoleItem>>({
      chemin: `/api/organisations/${idOrganisation}/ecoles${construireQueryString({ page, taillePage })}`,
      entetes: construireEntetesPilotageActif(contexte, {
        organisationId: idOrganisation,
        lectureOrganisationnelle: true,
      }),
    });
  },

  async consulterEcole(idEcole: string) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}`,
      entetes: construireEntetesPilotageActif(contexte, {
        ecoleId: idEcole,
      }),
    });
  },

  async creerEcole(payload: CreerEcolePayload) {
    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: '/api/ecoles',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation('ecole-create'),
    });
  },

  async renommerEcole(idEcole: string, nouveauNom: string) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}/renommer`,
      methode: 'PATCH',
      corps: { nouveauNom },
      entetes: {
        ...construireEntetesPilotageActif(contexte, { ecoleId: idEcole }),
        'idempotency-key': genererIdempotencyKey('ecole-rename'),
      },
    });
  },

  async changerModeExploitationEcole(idEcole: string, nouveauModeExploitation: string) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}/changer-mode`,
      methode: 'POST',
      corps: { nouveauModeExploitation },
      entetes: {
        ...construireEntetesPilotageActif(contexte, { ecoleId: idEcole }),
        'idempotency-key': genererIdempotencyKey('ecole-mode'),
      },
    });
  },

  async mettreAJourInformationsInstitutionnellesEcole(
    idEcole: string,
    payload: InformationsInstitutionnellesPayload,
  ) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}/informations-institutionnelles`,
      methode: 'PATCH',
      corps: payload,
      entetes: {
        ...construireEntetesPilotageActif(contexte, { ecoleId: idEcole }),
        'idempotency-key': genererIdempotencyKey('ecole-institutions'),
      },
    });
  },

  async activerEcole(idEcole: string) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}/activer`,
      methode: 'POST',
      corps: {},
      entetes: {
        ...construireEntetesPilotageActif(contexte, { ecoleId: idEcole }),
        'idempotency-key': genererIdempotencyKey('ecole-activate'),
      },
    });
  },

  async desactiverEcole(idEcole: string) {
    const contexte = lireContexteApiActif();

    return clientApi.envoyer<DetailResponse<EcoleItem>>({
      chemin: `/api/ecoles/${idEcole}/desactiver`,
      methode: 'POST',
      corps: {},
      entetes: {
        ...construireEntetesPilotageActif(contexte, { ecoleId: idEcole }),
        'idempotency-key': genererIdempotencyKey('ecole-deactivate'),
      },
    });
  },
};
