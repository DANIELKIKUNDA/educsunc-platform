import type {
  PaymentSettingsApiData,
  PaymentSettingsFormState,
  PaymentSettingsUpdateRequest,
  PaymentSettingsViewModel,
} from '../models/payment-settings.model';

function clonerTableBooleenne(source?: Record<string, boolean>): Record<string, boolean> {
  return { ...(source ?? {}) };
}

function clonerTableListes<TValeur extends string>(
  source?: Record<string, TValeur[]>,
): Record<string, TValeur[]> {
  return Object.fromEntries(
    Object.entries(source ?? {}).map(([cle, valeurs]) => [cle, [...valeurs]]),
  );
}

export function mapperPaymentSettingsViewModel(
  donnees: PaymentSettingsApiData,
): PaymentSettingsViewModel {
  return {
    id: donnees.idParametresPaiementEcole,
    ecoleId: donnees.idEcole,
    actif: donnees.actif,
    modesPaiementAutorises: [...donnees.modesPaiementAutorises],
    politiqueArrieres: donnees.politiqueArrieres,
    paiementPartielAutorise: donnees.paiementPartielAutorise,
    autoriserInscriptionAvecDette: donnees.autoriserInscriptionAvecDette,
    bloquerRetraitDocumentsSiDette: donnees.bloquerRetraitDocumentsSiDette,
    appliquerFamilleNombreuse: donnees.appliquerFamilleNombreuse,
    nombreEnfantsSeuilFamilleNombreuse: donnees.nombreEnfantsSeuilFamilleNombreuse,
    moisObligatoireInscription: donnees.moisObligatoireInscription,
    exigerFraisInscription: donnees.exigerFraisInscription,
    paiementPartielParTypeFrais: clonerTableBooleenne(donnees.paiementPartielParTypeFrais),
    perceptionDelegueeParTypeFrais: clonerTableListes(donnees.perceptionDelegueeParTypeFrais),
    consultationHistoriquePaiementsDeleguee: [...(donnees.consultationHistoriquePaiementsDeleguee ?? [])],
    exonerationDeleguee: [...(donnees.exonerationDeleguee ?? [])],
  };
}

export function mapperPaymentSettingsFormState(
  vue: PaymentSettingsViewModel | null,
): PaymentSettingsFormState {
  return {
    paiementPartielAutorise: vue?.paiementPartielAutorise ?? false,
    paiementPartielParTypeFrais: clonerTableBooleenne(vue?.paiementPartielParTypeFrais),
    perceptionDelegueeParTypeFrais: clonerTableListes(vue?.perceptionDelegueeParTypeFrais),
    consultationHistoriquePaiementsDeleguee: [...(vue?.consultationHistoriquePaiementsDeleguee ?? [])],
    exonerationDeleguee: [...(vue?.exonerationDeleguee ?? [])],
    politiqueArrieres: vue?.politiqueArrieres ?? 'AUTORISER_AVEC_SUIVI',
    autoriserInscriptionAvecDette: vue?.autoriserInscriptionAvecDette ?? false,
    bloquerRetraitDocumentsSiDette: vue?.bloquerRetraitDocumentsSiDette ?? false,
    appliquerFamilleNombreuse: vue?.appliquerFamilleNombreuse ?? false,
    nombreEnfantsSeuilFamilleNombreuse:
      vue?.nombreEnfantsSeuilFamilleNombreuse === undefined
        ? ''
        : String(vue.nombreEnfantsSeuilFamilleNombreuse),
    modesPaiementAutorises: [...(vue?.modesPaiementAutorises ?? [])],
    moisObligatoireInscription: vue?.moisObligatoireInscription ?? '',
    exigerFraisInscription: vue?.exigerFraisInscription ?? false,
  };
}

export function mapperPaymentSettingsRequest(
  formulaire: PaymentSettingsFormState,
): PaymentSettingsUpdateRequest {
  return {
    paiementPartielAutorise: formulaire.paiementPartielAutorise,
    paiementPartielParTypeFrais: { ...formulaire.paiementPartielParTypeFrais },
    perceptionDelegueeParTypeFrais: Object.fromEntries(
      Object.entries(formulaire.perceptionDelegueeParTypeFrais).map(([cle, valeurs]) => [cle, [...valeurs]]),
    ),
    consultationHistoriquePaiementsDeleguee: [...formulaire.consultationHistoriquePaiementsDeleguee],
    exonerationDeleguee: [...formulaire.exonerationDeleguee],
    politiqueArrieres: formulaire.politiqueArrieres,
    autoriserInscriptionAvecDette: formulaire.autoriserInscriptionAvecDette,
    bloquerRetraitDocumentsSiDette: formulaire.bloquerRetraitDocumentsSiDette,
    appliquerFamilleNombreuse: formulaire.appliquerFamilleNombreuse,
    nombreEnfantsSeuilFamilleNombreuse:
      formulaire.nombreEnfantsSeuilFamilleNombreuse.trim().length > 0
        ? Number.parseInt(formulaire.nombreEnfantsSeuilFamilleNombreuse, 10)
        : undefined,
    modesPaiementAutorises: [...formulaire.modesPaiementAutorises],
    moisObligatoireInscription:
      formulaire.moisObligatoireInscription === ''
        ? undefined
        : formulaire.moisObligatoireInscription,
    exigerFraisInscription: formulaire.exigerFraisInscription,
  };
}
