import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  PaymentHistoryApiData,
  PaymentHistoryEntry,
  PaymentHistoryViewModel,
  StudentDetailApiData,
  StudentPaymentHistoryProfile,
} from '../models/payment-history.model';

interface PaymentHistoryRouteContext {
  anneeScolaire?: string;
  classe?: string;
  section?: string;
}

function construireNomComplet(eleve: StudentDetailApiData): string {
  return [eleve.nom, eleve.postNom, eleve.prenom].filter(Boolean).join(' ');
}

function formaterDate(iso: string): { date: string; heure: string } {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return {
      date: iso,
      heure: '--:--',
    };
  }

  return {
    date: new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    heure: new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  };
}

export function mapperPaymentHistoryEntries(historique: PaymentHistoryApiData): PaymentHistoryEntry[] {
  return historique.paiements.map((paiement) => {
    const dateFormatee = formaterDate(paiement.creeLe);

    return {
      id: paiement.idPaiement,
      date: dateFormatee.date,
      heure: dateFormatee.heure,
      typeFrais: paiement.typeFraisDeclare,
      modePaiement: paiement.modePaiement,
      montant: paiement.montantTotal.montant,
      devise: paiement.montantTotal.devise,
      statut: paiement.statutPaiement,
    };
  });
}

export function mapperStudentPaymentHistoryProfile(
  eleve: StudentDetailApiData,
  routeContext?: PaymentHistoryRouteContext,
): StudentPaymentHistoryProfile {
  return {
    id: eleve.idEleve,
    matricule: eleve.matricule,
    fullName: construireNomComplet(eleve),
    sexe: eleve.sexe,
    classe: routeContext?.classe ?? 'Classe a connecter',
    section: routeContext?.section ?? activeContextStore.state.sectionName,
    anneeScolaire: routeContext?.anneeScolaire ?? activeContextStore.state.schoolYearLabel,
  };
}

export function mapperPaymentHistoryViewModel(
  eleve: StudentDetailApiData,
  historique: PaymentHistoryApiData,
  routeContext?: PaymentHistoryRouteContext,
): PaymentHistoryViewModel {
  return {
    profile: mapperStudentPaymentHistoryProfile(eleve, routeContext),
    entries: mapperPaymentHistoryEntries(historique),
  };
}
