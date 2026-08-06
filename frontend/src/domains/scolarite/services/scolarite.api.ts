import { clientApi } from '../../../shared/http/api.client';
import {
  construireEntetesContexteActif,
  lireContexteApiActif,
} from '../../../shared/session/api-context';
import type {
  AffectationCreationRequest,
  ChangementClasseRequest,
  ChangementStatutRequest,
  DetailResponse,
  EleveDetail,
  EleveItem,
  FamilleCreationRequest,
  FamilleModificationRequest,
  FamilleNombreuseItem,
  FamilleItem,
  InscriptionCompleteRequest,
  InscriptionItem,
  ListResponse,
  ParcoursEleveItem,
  RattachementFamilleRequest,
  ResponsableFamilleMutationRequest,
  ResponsableFamilleSuppressionRequest,
  ScolariteApiContext,
  AffectationItem,
  EleveAffecteClasseItem,
  EvenementParcoursItem,
} from '../models/scolarite.model';

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

function construireEntetesContexte(contexte: ScolariteApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend scolarite est incomplet.');
  }

  return construireEntetesContexteActif(contexte);
}

function construireEntetesMutation(
  contexte: ScolariteApiContext,
  prefixe: string,
): Record<string, string> {
  return {
    ...construireEntetesContexte(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiScolarite(): ScolariteApiContext {
  return lireContexteApiActif();
}

export const scolariteApi = {
  async creerInscriptionComplete(
    demande: InscriptionCompleteRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<{
      eleve: EleveDetail;
      inscription: InscriptionItem;
      affectation?: AffectationItem;
    }>>({
      chemin: '/api/inscriptions-scolaires/complete',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'inscription-complete'),
    });
  },

  async listerEleves(
    query: { page?: number; taillePage?: number },
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<ListResponse<EleveItem>>({
      chemin: `/api/eleves${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async rechercherEleves(
    query: {
      page?: number;
      taillePage?: number;
      matricule?: string;
      nom?: string;
      postNom?: string;
      prenom?: string;
      dateNaissance?: string;
    },
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<ListResponse<EleveItem>>({
      chemin: `/api/eleves/recherche${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEleve(idEleve: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerFamilles(
    query: {
      page?: number;
      taillePage?: number;
      nomFamille?: string;
      nomResponsable?: string;
      nomEleve?: string;
    },
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<ListResponse<FamilleItem>>({
      chemin: `/api/familles${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterFamille(idFamille: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async creerFamille(demande: FamilleCreationRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: '/api/familles',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'famille'),
    });
  },

  async modifierFamille(idFamille: string, demande: FamilleModificationRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}`,
      methode: 'PATCH',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'famille-modification'),
    });
  },

  async ajouterResponsableFamille(
    idFamille: string,
    demande: ResponsableFamilleMutationRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}/responsables`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'famille-responsable'),
    });
  },

  async modifierResponsableFamille(
    idFamille: string,
    idResponsableFamille: string,
    demande: ResponsableFamilleMutationRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}/responsables/${idResponsableFamille}`,
      methode: 'PATCH',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'famille-responsable-modification'),
    });
  },

  async retirerResponsableFamille(
    idFamille: string,
    idResponsableFamille: string,
    demande: ResponsableFamilleSuppressionRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}/responsables/${idResponsableFamille}`,
      methode: 'DELETE',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'famille-responsable-retrait'),
    });
  },

  async definirResponsablePrincipal(
    idFamille: string,
    idResponsableFamille: string,
    demande: ResponsableFamilleSuppressionRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<FamilleItem>>({
      chemin: `/api/familles/${idFamille}/responsable-principal`,
      methode: 'POST',
      corps: {
        idResponsableFamille,
        versionAttendue: demande.versionAttendue,
      },
      entetes: construireEntetesMutation(contexte, 'famille-responsable-principal'),
    });
  },

  async evaluerFamilleNombreuse(idFamille: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<FamilleNombreuseItem>>({
      chemin: `/api/familles/${idFamille}/famille-nombreuse`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async rattacherEleveAFamille(
    idEleve: string,
    demande: RattachementFamilleRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/rattacher-famille`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'eleve-rattacher-famille'),
    });
  },

  async detacherEleveDeFamille(
    idEleve: string,
    demande: ResponsableFamilleSuppressionRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/detacher-famille`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'eleve-detacher-famille'),
    });
  },

  async consulterAffectationActive(idInscriptionScolaire: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<AffectationItem>>({
      chemin: `/api/affectations-classes/active/${idInscriptionScolaire}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAffectation(idAffectationClasse: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<AffectationItem>>({
      chemin: `/api/affectations-classes/${idAffectationClasse}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerElevesParClasse(idClassePedagogique: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<ListResponse<EleveAffecteClasseItem>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/eleves`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async affecterEleve(demande: AffectationCreationRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<AffectationItem>>({
      chemin: '/api/affectations-classes',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'affectation'),
    });
  },

  async changerClasse(
    idInscriptionScolaire: string,
    demande: ChangementClasseRequest,
    contexte: ScolariteApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<AffectationItem>>({
      chemin: `/api/affectations-classes/${idInscriptionScolaire}/changer-classe`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'changement-classe'),
    });
  },

  async desactiverAffectation(idInscriptionScolaire: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<{ desactivee: boolean }>>({
      chemin: `/api/affectations-classes/${idInscriptionScolaire}/desactiver`,
      methode: 'POST',
      entetes: construireEntetesMutation(contexte, 'desactivation-affectation'),
    });
  },

  async consulterParcours(idEleve: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<ParcoursEleveItem>>({
      chemin: `/api/eleves/${idEleve}/parcours`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterEvenements(idEleve: string, contexte: ScolariteApiContext) {
    return clientApi.envoyer<ListResponse<EvenementParcoursItem>>({
      chemin: `/api/eleves/${idEleve}/evenements`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async declarerAbandon(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/abandon`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'abandon'),
    });
  },

  async transfererEleve(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/transfert`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'transfert'),
    });
  },

  async reintegrerEleve(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/reintegration`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'reintegration'),
    });
  },

  async reactiverEleve(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/reactivation`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'reactivation'),
    });
  },

  async declarerDeces(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/deces`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'deces'),
    });
  },

  async suspendreEleve(idEleve: string, demande: ChangementStatutRequest, contexte: ScolariteApiContext) {
    return clientApi.envoyer<DetailResponse<EleveDetail>>({
      chemin: `/api/eleves/${idEleve}/suspension`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'suspension'),
    });
  },
};
