import { ParametresPaiementEcole } from 'contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { MoisScolaire } from 'contexts/paiements-facturation/domain/value-objects/MoisScolaire';
import { PolitiqueArrieres } from 'contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface ParametresPaiementEcoleOutput {
  idParametresPaiementEcole: string;
  idEcole: string;
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Record<string, boolean>;
  politiqueArrieres: PolitiqueArrieres;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: ModePaiement[];
  moisObligatoireInscription?: MoisScolaire;
  exigerFraisInscription: boolean;
  actif: boolean;
}

export const versParametresPaiementOutput = (parametres: ParametresPaiementEcole): ParametresPaiementEcoleOutput => ({
  idParametresPaiementEcole: parametres.obtenirId(),
  idEcole: parametres.obtenirIdEcole(),
  paiementPartielAutorise: parametres.obtenirPaiementPartielAutorise(),
  paiementPartielParTypeFrais: parametres.obtenirPaiementPartielParTypeFrais() === undefined
    ? undefined
    : Object.fromEntries(parametres.obtenirPaiementPartielParTypeFrais() as Map<TypeFrais, boolean>),
  politiqueArrieres: parametres.obtenirPolitiqueArrieres(),
  autoriserInscriptionAvecDette: parametres.obtenirAutoriserInscriptionAvecDette(),
  bloquerRetraitDocumentsSiDette: parametres.obtenirBloquerRetraitDocumentsSiDette(),
  appliquerFamilleNombreuse: parametres.obtenirAppliquerFamilleNombreuse(),
  nombreEnfantsSeuilFamilleNombreuse: parametres.obtenirNombreEnfantsSeuilFamilleNombreuse(),
  modesPaiementAutorises: parametres.obtenirModesPaiementAutorises(),
  moisObligatoireInscription: parametres.obtenirMoisObligatoireInscription(),
  exigerFraisInscription: parametres.obtenirExigerFraisInscription(),
  actif: parametres.obtenirActif(),
});
