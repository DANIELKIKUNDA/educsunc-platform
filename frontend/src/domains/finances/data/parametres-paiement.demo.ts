export interface PaymentSettingsViewModel {
  modesPaiementAutorises: string[];
  paiementPartielAutorise: boolean;
  inscriptionAvecDetteAutorisee: boolean;
  retraitDocumentBloqueSiDette: boolean;
  politiqueArrieres: string;
  historiqueDelegueActif: boolean;
  updatedAt: string;
}

export const paymentSettingsViewModel: PaymentSettingsViewModel = {
  modesPaiementAutorises: ['Especes', 'Mobile Money', 'Virement'],
  paiementPartielAutorise: true,
  inscriptionAvecDetteAutorisee: false,
  retraitDocumentBloqueSiDette: true,
  politiqueArrieres: 'Blocage progressif des documents a partir du second arriere',
  historiqueDelegueActif: true,
  updatedAt: '25/06/2026 14:10',
};
