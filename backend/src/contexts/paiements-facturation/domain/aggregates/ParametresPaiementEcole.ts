import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ModePaiement } from '../value-objects/ModePaiement';
import { MoisScolaire } from '../value-objects/MoisScolaire';
import { PolitiqueArrieres } from '../value-objects/PolitiqueArrieres';
import { TypeFrais } from '../value-objects/TypeFrais';

export interface ProprietesParametresPaiementEcole {
  idParametresPaiementEcole: string;
  idEcole: string;
  paiementPartielAutorise: boolean;
  paiementPartielParTypeFrais?: Map<TypeFrais, boolean>;
  politiqueArrieres: PolitiqueArrieres;
  autoriserInscriptionAvecDette: boolean;
  bloquerRetraitDocumentsSiDette: boolean;
  appliquerFamilleNombreuse: boolean;
  nombreEnfantsSeuilFamilleNombreuse?: number;
  modesPaiementAutorises: ModePaiement[];
  moisObligatoireInscription?: MoisScolaire;
  exigerFraisInscription: boolean;
  actif: boolean;
  version: number;
}

export class ParametresPaiementEcole extends RacineAgregat<string> {
  private idEcole: string;
  private paiementPartielAutorise: boolean;
  private paiementPartielParTypeFrais?: Map<TypeFrais, boolean>;
  private politiqueArrieres: PolitiqueArrieres;
  private autoriserInscriptionAvecDette: boolean;
  private bloquerRetraitDocumentsSiDette: boolean;
  private appliquerFamilleNombreuse: boolean;
  private nombreEnfantsSeuilFamilleNombreuse?: number;
  private modesPaiementAutorises: ModePaiement[];
  private moisObligatoireInscription?: MoisScolaire;
  private exigerFraisInscription: boolean;
  private actif: boolean;
  private version: number;

  constructor(proprietes: ProprietesParametresPaiementEcole) {
    super(ParametresPaiementEcole.validerTexte(proprietes.idParametresPaiementEcole, 'idParametresPaiementEcole'));
    this.idEcole = ParametresPaiementEcole.validerTexte(proprietes.idEcole, 'idEcole');
    this.paiementPartielAutorise = proprietes.paiementPartielAutorise;
    this.paiementPartielParTypeFrais = proprietes.paiementPartielParTypeFrais === undefined
      ? undefined
      : new Map(proprietes.paiementPartielParTypeFrais);
    this.politiqueArrieres = proprietes.politiqueArrieres;
    this.autoriserInscriptionAvecDette = proprietes.autoriserInscriptionAvecDette;
    this.bloquerRetraitDocumentsSiDette = proprietes.bloquerRetraitDocumentsSiDette;
    this.appliquerFamilleNombreuse = proprietes.appliquerFamilleNombreuse;
    this.nombreEnfantsSeuilFamilleNombreuse = proprietes.nombreEnfantsSeuilFamilleNombreuse;
    this.modesPaiementAutorises = [...proprietes.modesPaiementAutorises];
    this.moisObligatoireInscription = proprietes.moisObligatoireInscription;
    this.exigerFraisInscription = proprietes.exigerFraisInscription;
    this.actif = proprietes.actif;
    this.version = ParametresPaiementEcole.validerVersion(proprietes.version);
    this.verifierCoherence();
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirPaiementPartielAutorise(): boolean { return this.paiementPartielAutorise; }
  public obtenirPaiementPartielParTypeFrais(): Map<TypeFrais, boolean> | undefined { return this.paiementPartielParTypeFrais === undefined ? undefined : new Map(this.paiementPartielParTypeFrais); }
  public obtenirPolitiqueArrieres(): PolitiqueArrieres { return this.politiqueArrieres; }
  public obtenirAutoriserInscriptionAvecDette(): boolean { return this.autoriserInscriptionAvecDette; }
  public obtenirBloquerRetraitDocumentsSiDette(): boolean { return this.bloquerRetraitDocumentsSiDette; }
  public obtenirAppliquerFamilleNombreuse(): boolean { return this.appliquerFamilleNombreuse; }
  public obtenirNombreEnfantsSeuilFamilleNombreuse(): number | undefined { return this.nombreEnfantsSeuilFamilleNombreuse; }
  public obtenirModesPaiementAutorises(): ModePaiement[] { return [...this.modesPaiementAutorises]; }
  public obtenirMoisObligatoireInscription(): MoisScolaire | undefined { return this.moisObligatoireInscription; }
  public obtenirExigerFraisInscription(): boolean { return this.exigerFraisInscription; }
  public obtenirActif(): boolean { return this.actif; }
  public obtenirVersion(): number { return this.version; }

  public activer(): void {
    this.actif = true;
    this.version += 1;
  }

  public desactiver(): void {
    this.actif = false;
    this.version += 1;
  }

  public estModePaiementAutorise(modePaiement: ModePaiement): boolean {
    return this.modesPaiementAutorises.includes(modePaiement);
  }

  public autorisePaiementPartielPour(typeFrais: TypeFrais): boolean {
    return this.paiementPartielAutorise || this.paiementPartielParTypeFrais?.get(typeFrais) === true;
  }

  public verifierCoherence(): void {
    if (this.modesPaiementAutorises.length === 0) {
      throw new Error('Les parametres de paiement doivent autoriser au moins un mode de paiement.');
    }

    if (this.appliquerFamilleNombreuse && (this.nombreEnfantsSeuilFamilleNombreuse === undefined || this.nombreEnfantsSeuilFamilleNombreuse < 2)) {
      throw new Error('Le seuil de famille nombreuse doit etre defini et superieur ou egal a 2.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private static validerVersion(version: number): number {
    if (!Number.isInteger(version) || version <= 0) {
      throw new Error('La version des parametres doit etre un entier positif.');
    }

    return version;
  }
}
