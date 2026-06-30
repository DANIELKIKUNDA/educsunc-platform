import { clientApi } from '../../../services/api';
import { sessionStore } from '../../../shared/auth/session.store';
import type {
  DetailResponse,
  FinanceApiContext,
  PaymentHistoryApiData,
  StudentDetailApiData,
} from '../models/payment-history.model';
import type {
  StudentDebtApiData,
  StudentDueFeesApiData,
} from '../models/student-financial-situation.model';
import type { StudentArrearsApiData } from '../models/student-arrears.model';
import type {
  PaymentSettingsApiData,
  PaymentSettingsUpdateRequest,
} from '../models/payment-settings.model';
import type {
  PaymentRegistrationApiData,
  PaymentRegistrationRequest,
} from '../models/payment-registration.model';
import type {
  TarificationGridDisableRequest,
  TarificationGridApiData,
  TarificationGridRequest,
  TarificationListFilters,
} from '../models/tarification.model';
import type {
  CashClosingRequest,
  CashDayApiData,
  CashOpeningRequest,
} from '../models/cash-opening.model';
import type { PaymentReceiptApiData } from '../models/payment-receipt.model';
import type {
  PaymentReceiptListApiData,
  PaymentReceiptListFilters,
} from '../models/payment-receipt-list.model';
import type { PaymentRefundApiData, PaymentRefundRequest } from '../models/payment-refund.model';
import type {
  ExonerationApiData,
  ExonerationGrantRequest,
} from '../models/exoneration.model';
import type {
  PaymentTypeAnalyticsApiData,
  PaymentTypeAnalyticsFilters,
} from '../models/payment-type-analytics.model';
import type { DailyFinancialReportApiData } from '../models/daily-financial-report.model';
import type {
  PaymentsByCashierApiData,
  PaymentsByCashierFilters,
} from '../models/payments-by-cashier.model';
import type {
  AnticipatedFundsApiData,
  AnticipatedFundsFilters,
} from '../models/anticipated-funds.model';
import type {
  ClassFinancialRegisterApiData,
  ClassFinancialRegisterFilters,
} from '../models/class-financial-register.model';
import type {
  ClassFinancialSummaryApiData,
  ClassFinancialSummaryFilters,
} from '../models/class-financial-summary.model';
import type {
  SectionFinancialSummaryApiData,
  SectionFinancialSummaryFilters,
} from '../models/section-financial-summary.model';
import type {
  SchoolFinancialSummaryApiData,
  SchoolFinancialSummaryFilters,
} from '../models/school-financial-summary.model';
import type {
  OrganizationFinancialSummaryApiData,
  OrganizationFinancialSummaryFilters,
} from '../models/organization-financial-summary.model';

function lireVariableEnvironnement(nom: string): string | null {
  const valeur = import.meta.env[nom];

  if (typeof valeur !== 'string') {
    return null;
  }

  const valeurNettoyee = valeur.trim();
  return valeurNettoyee.length === 0 ? null : valeurNettoyee;
}

export function lireContexteApiFinances(): FinanceApiContext {
  return {
    organisationId: lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_ID'),
    ecoleId: lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID'),
    utilisateurId: lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID'),
  };
}

function construireEntetesContexte(contexte: FinanceApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error(
      'Le contexte frontend finances est incomplet. Configurez VITE_REFERENTIEL_ORGANISATION_ID, VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.',
    );
  }

  return {
    'x-organisation-id': contexte.organisationId,
    'x-tenant-id': contexte.ecoleId,
    'x-user-id': contexte.utilisateurId,
    'x-role-actif': sessionStore.state.actorCode,
  };
}

function construireUrlApi(chemin: string): string {
  return `${clientApi.baseUrl}${chemin}`;
}

function construireQueryString(
  query: Record<string, string | boolean | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (typeof valeur === 'boolean') {
      params.set(cle, valeur ? 'true' : 'false');
      return;
    }

    if (valeur !== undefined && valeur.trim().length > 0) {
      params.set(cle, valeur);
    }
  });

  const serialise = params.toString();
  return serialise.length > 0 ? `?${serialise}` : '';
}

function extraireNomFichier(contentDisposition: string | null, fallback: string): string {
  if (contentDisposition === null) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="([^\"]+)"/i);
  return match?.[1] ?? fallback;
}

export const financesApi = {
  async consulterHistoriquePaiements(idEleve: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<PaymentHistoryApiData>>({
      chemin: `/api/eleves/${idEleve}/paiements`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async enregistrerPaiement(
    demande: PaymentRegistrationRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<PaymentRegistrationApiData>>({
      chemin: '/api/paiements',
      methode: 'POST',
      corps: demande,
      entetes: {
        ...construireEntetesContexte(contexte),
        'idempotency-key': demande.idempotencyKey,
      },
    });
  },

  async accorderExoneration(
    demande: ExonerationGrantRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ExonerationApiData>>({
      chemin: '/api/exonerations',
      methode: 'POST',
      corps: {
        idEleve: demande.idEleve,
        idObligation: demande.idObligation,
        typeExoneration: demande.typeExoneration,
        montantExonere: demande.montantExonere,
        raison: demande.raison,
        validePar: demande.validePar,
      },
      entetes: construireEntetesContexte(contexte),
    });
  },

  async annulerExoneration(
    idExoneration: string,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ExonerationApiData>>({
      chemin: `/api/exonerations/${idExoneration}/annulation`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesContexte(contexte),
    });
  },

  async ouvrirCaisseJour(
    demande: CashOpeningRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<CashDayApiData>>({
      chemin: '/api/caisse/ouverture',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterCaisseJour(
    date: string,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({ date });

    return clientApi.envoyer<DetailResponse<CashDayApiData>>({
      chemin: `/api/caisse/jour${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async cloturerCaisseJour(
    demande: CashClosingRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<CashDayApiData>>({
      chemin: '/api/caisse/cloture',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEleve(idEleve: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<StudentDetailApiData>>({
      chemin: `/api/eleves/${idEleve}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterDetteEleve(idEleve: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<StudentDebtApiData>>({
      chemin: `/api/eleves/${idEleve}/dette`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterArrieresEleve(idEleve: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<StudentArrearsApiData>>({
      chemin: `/api/eleves/${idEleve}/arrieres`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterFraisExigibles(idEleve: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<StudentDueFeesApiData>>({
      chemin: `/api/eleves/${idEleve}/frais-exigibles`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterRecuPaiement(idRecu: string, contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<PaymentReceiptApiData>>({
      chemin: `/api/recus/${idRecu}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterRecusPaiement(
    filtres: PaymentReceiptListFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idEleve: filtres.idEleve,
      numeroRecu: filtres.numeroRecu,
      dateDebut: filtres.dateDebut,
      dateFin: filtres.dateFin,
    });

    return clientApi.envoyer<DetailResponse<PaymentReceiptListApiData>>({
      chemin: `/api/recus${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async telechargerRecuPdf(idRecu: string, contexte: FinanceApiContext): Promise<{
    blob: Blob;
    nomFichier: string;
  }> {
    const reponse = await fetch(construireUrlApi(`/api/recus/${idRecu}/pdf`), {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        ...construireEntetesContexte(contexte),
      },
    });

    if (!reponse.ok) {
      throw new Error('Le PDF du recu n a pas pu etre charge.');
    }

    return {
      blob: await reponse.blob(),
      nomFichier: extraireNomFichier(
        reponse.headers.get('content-disposition'),
        `recu-${idRecu}.pdf`,
      ),
    };
  },

  async restituerExcedent(
    demande: PaymentRefundRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<PaymentRefundApiData>>({
      chemin: '/api/paiements/restitution',
      methode: 'POST',
      corps: {
        idPaiement: demande.idPaiement,
        idEleve: demande.idEleve,
        effectuePar: demande.effectuePar,
      },
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterPaiementsParTypeFrais(
    filtres: PaymentTypeAnalyticsFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      dateDebut: filtres.dateDebut,
      dateFin: filtres.dateFin,
    });

    return clientApi.envoyer<DetailResponse<PaymentTypeAnalyticsApiData>>({
      chemin: `/api/rapports-financiers/paiements-par-type-frais${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterRegistreFinancierClasse(
    filtres: ClassFinancialRegisterFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      idClassePedagogique: filtres.idClassePedagogique,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
    });

    return clientApi.envoyer<DetailResponse<ClassFinancialRegisterApiData>>({
      chemin: `/api/rapports-financiers/registre-classe${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterSyntheseFinanciereClasse(
    filtres: ClassFinancialSummaryFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      idClassePedagogique: filtres.idClassePedagogique,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
      typeFrais: filtres.typeFrais,
    });

    return clientApi.envoyer<DetailResponse<ClassFinancialSummaryApiData>>({
      chemin: `/api/rapports-financiers/synthese-classe${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterSyntheseFinanciereSection(
    filtres: SectionFinancialSummaryFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      idSectionScolaire: filtres.idSectionScolaire,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
      typeFrais: filtres.typeFrais,
    });

    return clientApi.envoyer<DetailResponse<SectionFinancialSummaryApiData>>({
      chemin: `/api/rapports-financiers/synthese-section${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterSyntheseFinanciereEcole(
    filtres: SchoolFinancialSummaryFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
      typeFrais: filtres.typeFrais,
    });

    return clientApi.envoyer<DetailResponse<SchoolFinancialSummaryApiData>>({
      chemin: `/api/rapports-financiers/synthese-ecole${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterSyntheseFinanciereOrganisation(
    filtres: OrganizationFinancialSummaryFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      moisAnalyseJusqua: filtres.moisAnalyseJusqua,
      typeFrais: filtres.typeFrais,
    });

    return clientApi.envoyer<DetailResponse<OrganizationFinancialSummaryApiData>>({
      chemin: `/api/rapports-financiers/synthese-organisation${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterRapportFinancierJournalier(date: string, contexte: FinanceApiContext) {
    const query = construireQueryString({ date });

    return clientApi.envoyer<DetailResponse<DailyFinancialReportApiData>>({
      chemin: `/api/rapports-financiers/journalier${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterPaiementsParCaissier(
    filtres: PaymentsByCashierFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      dateDebut: filtres.dateDebut,
      dateFin: filtres.dateFin,
    });

    return clientApi.envoyer<DetailResponse<PaymentsByCashierApiData>>({
      chemin: `/api/rapports-financiers/paiements-par-caissier${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterFondsAnticipes(
    filtres: AnticipatedFundsFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      dateDebut: filtres.dateDebut,
      dateFin: filtres.dateFin,
    });

    return clientApi.envoyer<DetailResponse<AnticipatedFundsApiData>>({
      chemin: `/api/rapports-financiers/fonds-anticipes${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterParametresPaiement(contexte: FinanceApiContext) {
    return clientApi.envoyer<DetailResponse<PaymentSettingsApiData | null>>({
      chemin: '/api/paiements/parametres',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async configurerParametresPaiement(
    demande: PaymentSettingsUpdateRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<PaymentSettingsApiData>>({
      chemin: '/api/paiements/parametres',
      methode: 'PUT',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterGrillesTarification(
    filtres: TarificationListFilters,
    contexte: FinanceApiContext,
  ) {
    const query = construireQueryString({
      idAnneeScolaire: filtres.idAnneeScolaire,
      typeFrais: filtres.typeFrais,
      actif: filtres.actif,
    });

    return clientApi.envoyer<DetailResponse<TarificationGridApiData[]>>({
      chemin: `/api/tarification/grilles${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async creerGrilleTarification(
    demande: TarificationGridRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<TarificationGridApiData>>({
      chemin: '/api/tarification/grilles',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async modifierGrilleTarification(
    idGrilleTarification: string,
    demande: TarificationGridRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<TarificationGridApiData>>({
      chemin: `/api/tarification/grilles/${idGrilleTarification}`,
      methode: 'PUT',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async desactiverGrilleTarification(
    idGrilleTarification: string,
    demande: TarificationGridDisableRequest,
    contexte: FinanceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<TarificationGridApiData>>({
      chemin: `/api/tarification/grilles/${idGrilleTarification}/desactivation`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },
};
