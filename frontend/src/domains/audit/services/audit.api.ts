import { clientApi } from '../../../services/api';
import { sessionStore } from '../../../shared/auth/session.store';
import type {
  AuditAnalyticsFilters,
  AuditApiContext,
  AuditListFilters,
  AuditMonitoringFilters,
  AuditPedagogicalFilters,
} from '../models/audit.model';

function lireVariableEnvironnement(nom: string): string | null {
  const valeur = import.meta.env[nom];

  if (typeof valeur !== 'string') {
    return null;
  }

  const valeurNettoyee = valeur.trim();
  return valeurNettoyee.length > 0 ? valeurNettoyee : null;
}

function construireQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur === undefined) {
      return;
    }

    const serialisee = String(valeur).trim();
    if (serialisee.length > 0) {
      params.set(cle, serialisee);
    }
  });

  const sortie = params.toString();
  return sortie.length > 0 ? `?${sortie}` : '';
}

function construireEntetesContexte(contexte: AuditApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error(
      'Le contexte frontend audit est incomplet. Configurez VITE_REFERENTIEL_ORGANISATION_ID, VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.',
    );
  }

  return {
    'x-organisation-id': contexte.organisationId,
    'x-tenant-id': contexte.ecoleId,
    'x-ecole-id': contexte.ecoleId,
    'x-user-id': contexte.utilisateurId,
    'x-role-actif': sessionStore.state.actorCode,
  };
}

export function lireContexteApiAudit(): AuditApiContext {
  return {
    organisationId: lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_ID'),
    ecoleId: lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID'),
    utilisateurId: lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID'),
  };
}

export const auditApi = {
  async consulterAuditPlateformeListe(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      page: filtres.page,
      taillePage: filtres.taillePage,
      action: filtres.action,
      typeAuditPrincipal: filtres.typeAuditPrincipal,
      categorieAudit: filtres.categorieAudit,
      gravite: filtres.gravite,
      resultat: filtres.resultat,
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/audit${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPlateformeTimeline(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      categorieAudit: filtres.categorieAudit,
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/audit/timeline${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPlateformeHistorique(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      page: filtres.page,
      taillePage: filtres.taillePage,
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      categorieAudit: filtres.categorieAudit,
      action: filtres.action,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/audit/history${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditOrganisationAnalytics(
    filtres: AuditAnalyticsFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      ecoleId: filtres.ecoleId,
      typeAuditPrincipal: filtres.typeAuditPrincipal,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/analytics/audit${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditOrganisationTenants(
    filtres: AuditAnalyticsFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      ecoleId: filtres.ecoleId,
      typeAuditPrincipal: filtres.typeAuditPrincipal,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/analytics/tenants${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditOrganisationAnomalies(
    filtres: AuditMonitoringFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      metrique: filtres.metrique,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/anomalies${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditOrganisationAccess(
    filtres: AuditMonitoringFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      metrique: filtres.metrique,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/security/access${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditFinancierListe(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      page: filtres.page,
      taillePage: filtres.taillePage,
      action: filtres.action,
      gravite: filtres.gravite,
      resultat: filtres.resultat,
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/ecole/audit/administratif-financier${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditFinancierTimeline(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/ecole/audit/administratif-financier/timeline${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditFinancierHistorique(
    filtres: AuditListFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      page: filtres.page,
      taillePage: filtres.taillePage,
      acteurId: filtres.acteurId,
      ressourceId: filtres.ressourceId,
      action: filtres.action,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/ecole/audit/administratif-financier/history${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditTechniqueTraces(
    filtres: AuditMonitoringFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      correlationId: filtres.correlationId,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/ecole/audit/technique/traces${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditTechniqueMetrics(
    filtres: AuditMonitoringFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      periode: filtres.periode,
      metrique: filtres.metrique,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/v1/ecole/audit/technique/metrics${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPedagogiqueCotes(
    filtres: AuditPedagogicalFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      idFicheCotationEleveCours: filtres.idFicheCotationEleveCours,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/audit/cotes${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPedagogiqueConduite(
    filtres: AuditPedagogicalFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      idResultatBulletinEleve: filtres.idResultatBulletinEleve,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/audit/conduite${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPedagogiqueBulletins(
    filtres: AuditPedagogicalFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      idBulletinEleve: filtres.idBulletinEleve,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/audit/bulletins${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAuditPedagogiqueClassements(
    filtres: AuditPedagogicalFilters,
    contexte: AuditApiContext,
  ) {
    const query = construireQueryString({
      idClassePedagogique: filtres.idClassePedagogique,
      idAnneeScolaire: filtres.idAnneeScolaire,
      codeColonne: filtres.codeColonne,
    });

    return clientApi.envoyer<unknown>({
      chemin: `/api/audit/classements${query}`,
      entetes: construireEntetesContexte(contexte),
    });
  },
};
