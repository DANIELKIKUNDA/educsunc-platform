import type {
  PaymentReceiptListApiData,
  PaymentReceiptListViewModel,
  StudentDetailsIndex,
} from '../models/payment-receipt-list.model';

function construireNomEleve(idEleve: string, index: StudentDetailsIndex): string {
  const eleve = index[idEleve];

  if (!eleve) {
    return idEleve;
  }

  return [eleve.nom, eleve.postNom, eleve.prenom].filter(Boolean).join(' ');
}

function formaterDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('fr-FR').format(date);
}

export function mapperPaymentReceiptListViewModel(
  recus: PaymentReceiptListApiData,
  eleves: StudentDetailsIndex,
): PaymentReceiptListViewModel {
  return {
    totalRecus: recus.recus.length,
    filtres: { ...recus.filtres },
    rows: recus.recus.map((recu) => ({
      idRecu: recu.idRecu,
      numeroRecu: recu.numeroRecu,
      idPaiement: recu.idPaiement,
      idEleve: recu.idEleve,
      eleveNom: construireNomEleve(recu.idEleve, eleves),
      dateEmission: formaterDate(recu.dateEmission),
      heureEmission: recu.heureEmission,
      modePaiement: recu.modePaiement,
      totalPaye: recu.totalPaye.montant,
      devise: recu.totalPaye.devise,
      statutRecu: recu.statutRecu,
    })),
  };
}
