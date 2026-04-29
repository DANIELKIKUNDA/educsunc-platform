import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { MoisScolaire } from 'contexts/paiements-facturation/domain/value-objects/MoisScolaire';
import { PolitiqueArrieres } from 'contexts/paiements-facturation/domain/value-objects/PolitiqueArrieres';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface ConfigurerParametresPaiementEcoleInput {
  idEcole: string;
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Record<TypeFrais, boolean>;
  politiqueArrieres: PolitiqueArrieres;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: ModePaiement[];
  moisObligatoireInscription?: MoisScolaire;
  exigerFraisInscription: boolean;
}
