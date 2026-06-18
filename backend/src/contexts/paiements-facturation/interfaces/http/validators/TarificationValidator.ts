import type {
  CreerGrilleTarificationInput,
  DesactiverGrilleTarificationInput,
  ListerGrillesTarificationInput,
  ModifierGrilleTarificationInput,
} from '../../../application/dto/input/TarificationEntreeDTO';
import { CategorieFraisEtat } from '../../../domain/value-objects/CategorieFraisEtat';
import { CategorieTechnique } from '../../../domain/value-objects/CategorieTechnique';
import { MoisScolaire } from '../../../domain/value-objects/MoisScolaire';
import { TrancheFraisEtat } from '../../../domain/value-objects/TrancheFraisEtat';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';
import { ParamValidator } from './ParamValidator';

function lireBooleenOptionnel(source: Record<string, unknown>, nomChamp: string): boolean | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }
  if (typeof valeur !== 'boolean') {
    throw new Error(`Le champ "${nomChamp}" doit etre un booleen.`);
  }
  return valeur;
}

function lireEnumOptionnel<TValeur extends string>(
  source: Record<string, unknown>,
  nomChamp: string,
  enumeration: Record<string, TValeur>,
): TValeur | undefined {
  const valeur = ValidationHttpPaiementsFacturation.lireChaineOptionnelle(source, nomChamp);
  if (valeur === undefined) {
    return undefined;
  }

  const valeursPossibles = Object.values(enumeration);
  if (!valeursPossibles.includes(valeur as TValeur)) {
    throw new Error(`Le champ "${nomChamp}" doit appartenir a l'enumeration attendue.`);
  }

  return valeur as TValeur;
}

export class TarificationValidator {
  public static validerCreation(corps: unknown, headers: unknown): CreerGrilleTarificationInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idAnneeScolaire: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idAnneeScolaire'),
      typeFrais: ValidationHttpPaiementsFacturation.lireEnumRequis(donnees, 'typeFrais', TypeFrais),
      libelle: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'libelle'),
      montant: ValidationHttpPaiementsFacturation.lireMontantRequis(donnees, 'montant'),
      section: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'section'),
      categorieFraisEtat: lireEnumOptionnel(donnees, 'categorieFraisEtat', CategorieFraisEtat),
      categorieTechnique: lireEnumOptionnel(donnees, 'categorieTechnique', CategorieTechnique),
      estClasseTENASOSP: lireBooleenOptionnel(donnees, 'estClasseTENASOSP'),
      estClasseEXETAT: lireBooleenOptionnel(donnees, 'estClasseEXETAT'),
      estClasseFinaliste: lireBooleenOptionnel(donnees, 'estClasseFinaliste'),
      moisScolaire: lireEnumOptionnel(donnees, 'moisScolaire', MoisScolaire),
      trancheFraisEtat: lireEnumOptionnel(donnees, 'trancheFraisEtat', TrancheFraisEtat),
      obligatoire: lireBooleenRequis(donnees, 'obligatoire'),
      dateDebutValidite: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateDebutValidite'),
      dateFinValidite: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateFinValidite'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      creePar: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'creePar'),
    };
  }

  public static validerListe(query: unknown, headers: unknown): ListerGrillesTarificationInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idAnneeScolaire: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idAnneeScolaire'),
      typeFrais: lireEnumOptionnel(donnees, 'typeFrais', TypeFrais),
      actif: lireBooleenOptionnel(donnees, 'actif'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
    };
  }

  public static validerModification(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): ModifierGrilleTarificationInput {
    const donneesCorps = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');
    const donneesParams = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donneesCorps, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donneesCorps, headers),
      idGrilleTarification: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesParams,
        'idGrilleTarification',
      ),
      idAnneeScolaire: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesCorps,
        'idAnneeScolaire',
      ),
      libelle: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donneesCorps, 'libelle'),
      montant: donneesCorps.montant === undefined
        ? undefined
        : ValidationHttpPaiementsFacturation.lireMontantRequis(donneesCorps, 'montant'),
      section: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donneesCorps, 'section'),
      categorieFraisEtat: lireEnumOptionnel(donneesCorps, 'categorieFraisEtat', CategorieFraisEtat),
      categorieTechnique: lireEnumOptionnel(donneesCorps, 'categorieTechnique', CategorieTechnique),
      estClasseTENASOSP: lireBooleenOptionnel(donneesCorps, 'estClasseTENASOSP'),
      estClasseEXETAT: lireBooleenOptionnel(donneesCorps, 'estClasseEXETAT'),
      estClasseFinaliste: lireBooleenOptionnel(donneesCorps, 'estClasseFinaliste'),
      moisScolaire: lireEnumOptionnel(donneesCorps, 'moisScolaire', MoisScolaire),
      trancheFraisEtat: lireEnumOptionnel(donneesCorps, 'trancheFraisEtat', TrancheFraisEtat),
      obligatoire: lireBooleenOptionnel(donneesCorps, 'obligatoire'),
      actif: lireBooleenOptionnel(donneesCorps, 'actif'),
      dateDebutValidite: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donneesCorps, 'dateDebutValidite'),
      dateFinValidite: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donneesCorps, 'dateFinValidite'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      modifiePar: ParamValidator.lireIdentifiantUtilisateur(donneesCorps, headers, 'modifiePar'),
    };
  }

  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): DesactiverGrilleTarificationInput {
    const donneesCorps = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');
    const donneesParams = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donneesCorps, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donneesCorps, headers),
      idGrilleTarification: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesParams,
        'idGrilleTarification',
      ),
      idAnneeScolaire: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesCorps,
        'idAnneeScolaire',
      ),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      modifiePar: ParamValidator.lireIdentifiantUtilisateur(donneesCorps, headers, 'modifiePar'),
    };
  }
}

function lireBooleenRequis(source: Record<string, unknown>, nomChamp: string): boolean {
  const valeur = source[nomChamp];
  if (typeof valeur !== 'boolean') {
    throw new Error(`Le champ "${nomChamp}" doit etre un booleen.`);
  }
  return valeur;
}
