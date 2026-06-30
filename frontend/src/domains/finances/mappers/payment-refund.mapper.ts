import type {
  PaymentRefundApiData,
  PaymentRefundViewModel,
} from '../models/payment-refund.model';

export function mapperPaymentRefundViewModel(
  restitution: PaymentRefundApiData,
): PaymentRefundViewModel {
  return {
    idRestitution: restitution.idRestitution,
    montant: restitution.montant.montant,
    devise: restitution.montant.devise,
    raison: restitution.raison,
  };
}
