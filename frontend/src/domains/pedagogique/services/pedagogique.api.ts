import { ApiError, clientApi } from '../../../shared/http/api.client';
import { queueService } from '../../../offline/queue/queue.service';
import {
  construireEntetesContexteActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type {
  ComparatifClasseApiData,
  CoursProblematiqueApiData,
  DossierDeliberationApiData,
  EleveEchecApiData,
  EligibilitePerequationApiData,
  EvolutionResultatApiData,
  NonClasseApiData,
  PaginatedResponse,
  PedagogicalApiContext,
  ResultatBulletinApiData,
  StudentResultDetailResponse,
} from '../models/pedagogical-analysis.model';
import type { DetailResponse } from '../../finances/models/payment-history.model';
import type { ClassStatisticsApiData } from '../models/class-statistics.model';
import type { ClassRankingApiData } from '../models/class-ranking.model';
import type { AuditConduiteApiEntry, ConduiteClasseApiData } from '../models/conduite-management.model';
import type { GradeSheetApiRow, GradeSheetResponse } from '../models/grade-sheet.model';
import type { BulletinGenerationRequest } from '../models/bulletin-generation.model';
import type { ProclamationGenerationRequest } from '../models/proclamation-generation.model';

function construireQueryString(query: Record<string, string | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur.trim().length > 0) {
      params.set(cle, valeur);
    }
  });

  const serialise = params.toString();
  return serialise.length > 0 ? `?${serialise}` : '';
}

function construireEntetesContexte(contexte: PedagogicalApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend pedagogique est incomplet.');
  }

  return construireEntetesContexteActif(contexte);
}

export function lireContexteApiPedagogique(): PedagogicalApiContext {
  return lireContexteApiActif();
}

export const pedagogiqueApi = {
  async genererBulletin(
    demande: BulletinGenerationRequest,
    contexte: PedagogicalApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<{
      idBulletinEleve: string;
      idEleve: string;
      idInscriptionScolaire: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
      versionBulletin: number;
      etatBulletin: string;
      typeStructureEvaluation: string;
      lignes: unknown[];
      blocsApplicationConduite: unknown[];
    }>>({
      chemin: '/api/bulletins/generer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async genererProclamation(
    demande: ProclamationGenerationRequest,
    contexte: PedagogicalApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<{
      idProclamationClasse: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
      codeColonne: string;
      typeProclamation: string;
      lignes: unknown[];
      nonClasses: unknown[];
      abandons: unknown[];
      statistiques?: { classesTotal?: number };
    }>>({
      chemin: '/api/proclamations/generer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterConduiteClasse(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<DetailResponse<ConduiteClasseApiData>>({
      chemin: `/api/conduite/classe${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterFichesCotationClasseCours(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; idReferentielCours: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      idReferentielCours: filtres.idReferentielCours,
    });

    return clientApi.envoyer<GradeSheetResponse>({
      chemin: `/api/fiches-cotation/classe/${filtres.idClassePedagogique}${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async encoderCote(
    demande: { idFicheCotationEleveCours: string; codeColonne: string; cote: number; versionAttendue: number },
    contexte: PedagogicalApiContext,
    offlineSchoolYearId?: string,
  ) {
    const idempotencyKey = crypto.randomUUID();
    try {
      return await clientApi.envoyer<DetailResponse<GradeSheetApiRow>>({
        chemin: '/api/cotes',
        methode: 'POST',
        corps: demande,
        entetes: {
          ...construireEntetesContexte(contexte),
          'x-idempotency-key': idempotencyKey,
        },
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'NETWORK_ERROR') throw error;
      await queueService.enqueue({
        operationType: 'ENCODER_COTE',
        payload: demande,
        idempotencyKey,
        schoolYearId: offlineSchoolYearId,
      });
      return { queuedOffline: true as const };
    }
  },

  async modifierCote(
    demande: { idFicheCotationEleveCours: string; codeColonne: string; nouvelleCote: number; versionAttendue: number },
    contexte: PedagogicalApiContext,
    offlineSchoolYearId?: string,
  ) {
    const idempotencyKey = crypto.randomUUID();
    try {
      return await clientApi.envoyer<DetailResponse<GradeSheetApiRow>>({
        chemin: `/api/cotes/${demande.idFicheCotationEleveCours}`,
        methode: 'PUT',
        corps: {
          codeColonne: demande.codeColonne,
          nouvelleCote: demande.nouvelleCote,
          versionAttendue: demande.versionAttendue,
        },
        entetes: {
          ...construireEntetesContexte(contexte),
          'x-idempotency-key': idempotencyKey,
        },
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'NETWORK_ERROR') throw error;
      await queueService.enqueue({
        operationType: 'MODIFIER_COTE',
        payload: demande,
        idempotencyKey,
        schoolYearId: offlineSchoolYearId,
      });
      return { queuedOffline: true as const };
    }
  },

  async viderCote(
    demande: { idFicheCotationEleveCours: string; codeColonne: string; versionAttendue: number },
    contexte: PedagogicalApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<GradeSheetApiRow>>({
      chemin: `/api/cotes/${demande.idFicheCotationEleveCours}`,
      methode: 'DELETE',
      corps: {
        codeColonne: demande.codeColonne,
        versionAttendue: demande.versionAttendue,
      },
      entetes: construireEntetesContexte(contexte),
    });
  },

  async encoderConduite(
    demande: { idResultatBulletinEleve: string; codePeriode: string; pointsConduite: number },
    contexte: PedagogicalApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ResultatBulletinApiData>>({
      chemin: '/api/conduite',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditConduite(
    idResultatBulletinEleve: string,
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString({ idResultatBulletinEleve });

    return clientApi.envoyer<DetailResponse<AuditConduiteApiEntry[]>>({
      chemin: `/api/audit/conduite${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterStatistiquesClasse(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<DetailResponse<ClassStatisticsApiData>>({
      chemin: `/api/statistiques/classes${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterClassementClasse(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      codeColonne: filtres.codeColonne,
    });

    return clientApi.envoyer<DetailResponse<ClassRankingApiData>>({
      chemin: `/api/classements/classe/${filtres.idClassePedagogique}${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterResultatEleve(
    idEleve: string,
    idAnneeScolaire: string,
    contexte: PedagogicalApiContext,
  ) {
    return clientApi.envoyer<StudentResultDetailResponse>({
      chemin: `/api/resultats/${idEleve}/${idAnneeScolaire}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEvolutionResultat(
    idEleve: string,
    idAnneeScolaire: string,
    codeColonne: string | undefined,
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString({ codeColonne });

    return clientApi.envoyer<PaginatedResponse<EvolutionResultatApiData>>({
      chemin: `/api/resultats/evolution/${idEleve}/${idAnneeScolaire}${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEchecsClasse(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<EleveEchecApiData>>({
      chemin: `/api/resultats/echecs${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEchecsProfondsClasse(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<EleveEchecApiData>>({
      chemin: `/api/resultats/echecs-profonds${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterCoursProblematiques(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<CoursProblematiqueApiData>>({
      chemin: `/api/resultats/cours-problematiques${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterComparatifClasses(
    filtres: { idClassesPedagogiques: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<ComparatifClasseApiData>>({
      chemin: `/api/resultats/comparatif-classes${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterPerequation(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<EligibilitePerequationApiData>>({
      chemin: `/api/resultats/perequation${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterRepechage(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<DossierDeliberationApiData>>({
      chemin: `/api/resultats/repechage${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterDeliberation(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<DossierDeliberationApiData>>({
      chemin: `/api/resultats/deliberation${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterSecondeSession(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<DossierDeliberationApiData>>({
      chemin: `/api/resultats/seconde-session${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterNonClasses(
    filtres: { idClassePedagogique: string; idAnneeScolaire: string; codeColonne: string },
    contexte: PedagogicalApiContext,
  ) {
    const query = construireQueryString(filtres);

    return clientApi.envoyer<PaginatedResponse<NonClasseApiData>>({
      chemin: `/api/resultats/non-classes${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },
};
