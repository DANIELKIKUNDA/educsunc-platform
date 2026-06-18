import type {
  ConfigurerParametresPaiementEcoleInput,
  ConsulterParametresPaiementEcoleInput,
  RoleConsultationHistoriquePaiementsDeleguee,
  RoleExonerationDeleguee,
  RolePerceptionDeleguee,
} from '../../../application/dto/input/ParametresPaiementEntreeDTO';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { PolitiqueArrieres } from '../../../domain/value-objects/PolitiqueArrieres';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';
import { ParamValidator } from './ParamValidator';

function lireBooleenRequis(source: Record<string, unknown>, nomChamp: string): boolean {
  const valeur = source[nomChamp];
  if (typeof valeur !== 'boolean') {
    throw new Error(`Le champ "${nomChamp}" doit etre un booleen.`);
  }
  return valeur;
}

function lireNombreOptionnel(source: Record<string, unknown>, nomChamp: string): number | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }
  if (typeof valeur !== 'number' || !Number.isInteger(valeur)) {
    throw new Error(`Le champ "${nomChamp}" doit etre un entier.`);
  }
  return valeur;
}

function lireTableBooleenne(source: Record<string, unknown>, nomChamp: string): Record<string, boolean> | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  const objet = ValidationHttpPaiementsFacturation.obtenirObjet(valeur, nomChamp);
  const resultat: Record<string, boolean> = {};

  for (const [cle, brut] of Object.entries(objet)) {
    if (typeof brut !== 'boolean') {
      throw new Error(`Le champ "${nomChamp}.${cle}" doit etre un booleen.`);
    }
    resultat[cle] = brut;
  }

  return resultat;
}

function lireTableRolesPerception(
  source: Record<string, unknown>,
  nomChamp: string,
): Partial<Record<string, RolePerceptionDeleguee[]>> | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  const objet = ValidationHttpPaiementsFacturation.obtenirObjet(valeur, nomChamp);
  const resultat: Partial<Record<string, RolePerceptionDeleguee[]>> = {};

  for (const [cle, brut] of Object.entries(objet)) {
    if (!Array.isArray(brut)) {
      throw new Error(`Le champ "${nomChamp}.${cle}" doit etre une liste.`);
    }
    resultat[cle] = brut.map((role) => {
      if (
        role !== 'PREFET_ETUDES'
        && role !== 'DIRECTEUR_PRIMAIRE'
        && role !== 'DIRECTEUR_MATERNELLE'
      ) {
        throw new Error(`Le role "${String(role)}" est invalide pour ${nomChamp}.${cle}.`);
      }
      return role;
    });
  }

  return resultat;
}

function lireListeRolesConsultation(
  source: Record<string, unknown>,
  nomChamp: string,
): RoleConsultationHistoriquePaiementsDeleguee[] | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }
  if (!Array.isArray(valeur)) {
    throw new Error(`Le champ "${nomChamp}" doit etre une liste.`);
  }

  return valeur.map((role) => {
    if (
      role !== 'TITULAIRE'
      && role !== 'PREFET_ETUDES'
      && role !== 'DIRECTEUR_ETUDES'
      && role !== 'DIRECTEUR_PRIMAIRE'
      && role !== 'DIRECTEUR_MATERNELLE'
    ) {
      throw new Error(`Le role "${String(role)}" est invalide pour ${nomChamp}.`);
    }
    return role;
  });
}

function lireListeRolesExoneration(
  source: Record<string, unknown>,
  nomChamp: string,
): RoleExonerationDeleguee[] | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }
  if (!Array.isArray(valeur)) {
    throw new Error(`Le champ "${nomChamp}" doit etre une liste.`);
  }

  return valeur.map((role) => {
    if (role !== 'SECRETAIRE') {
      throw new Error(`Le role "${String(role)}" est invalide pour ${nomChamp}.`);
    }
    return role;
  });
}

function lireListeModesPaiement(source: Record<string, unknown>, nomChamp: string): ModePaiement[] {
  const valeur = source[nomChamp];
  if (!Array.isArray(valeur) || valeur.length === 0) {
    throw new Error(`Le champ "${nomChamp}" doit etre une liste non vide.`);
  }

  return valeur.map((mode) => {
    if (!Object.values(ModePaiement).includes(mode as ModePaiement)) {
      throw new Error(`Le mode de paiement "${String(mode)}" est invalide.`);
    }
    return mode as ModePaiement;
  });
}

export class ParametresPaiementValidator {
  public static validerConsultation(headers: unknown): ConsulterParametresPaiementEcoleInput {
    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation({}, headers),
      idEcole: ParamValidator.lireIdentifiantEcole({}, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur({}, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
    };
  }

  public static validerConfiguration(
    corps: unknown,
    headers: unknown,
  ): ConfigurerParametresPaiementEcoleInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      paiementPartielAutorise: lireBooleenRequis(donnees, 'paiementPartielAutorise'),
      paiementPartielParTypeFrais: lireTableBooleenne(donnees, 'paiementPartielParTypeFrais'),
      perceptionDelegueeParTypeFrais: lireTableRolesPerception(donnees, 'perceptionDelegueeParTypeFrais'),
      consultationHistoriquePaiementsDeleguee: lireListeRolesConsultation(
        donnees,
        'consultationHistoriquePaiementsDeleguee',
      ),
      exonerationDeleguee: lireListeRolesExoneration(
        donnees,
        'exonerationDeleguee',
      ),
      politiqueArrieres: ValidationHttpPaiementsFacturation.lireEnumRequis(
        donnees,
        'politiqueArrieres',
        PolitiqueArrieres,
      ),
      autoriserInscriptionAvecDette: lireBooleenRequis(donnees, 'autoriserInscriptionAvecDette'),
      bloquerRetraitDocumentsSiDette: lireBooleenRequis(donnees, 'bloquerRetraitDocumentsSiDette'),
      appliquerFamilleNombreuse: lireBooleenRequis(donnees, 'appliquerFamilleNombreuse'),
      nombreEnfantsSeuilFamilleNombreuse: lireNombreOptionnel(
        donnees,
        'nombreEnfantsSeuilFamilleNombreuse',
      ),
      modesPaiementAutorises: lireListeModesPaiement(donnees, 'modesPaiementAutorises'),
      moisObligatoireInscription: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(
        donnees,
        'moisObligatoireInscription',
      ) as ConfigurerParametresPaiementEcoleInput['moisObligatoireInscription'],
      exigerFraisInscription: lireBooleenRequis(donnees, 'exigerFraisInscription'),
    };
  }
}
