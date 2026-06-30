import {
  type TarificationFormState,
  type TarificationCurrencyCode,
  type TarificationGridApiData,
  type TarificationGridRequest,
  type TarificationGridRow,
} from '../models/tarification.model';

function construireRegle(grille: TarificationGridApiData): string {
  const morceaux: string[] = [];

  if (grille.moisScolaire) {
    morceaux.push(grille.moisScolaire);
  }
  if (grille.categorieFraisEtat) {
    morceaux.push(grille.categorieFraisEtat);
  }
  if (grille.trancheFraisEtat) {
    morceaux.push(grille.trancheFraisEtat);
  }
  if (grille.categorieTechnique) {
    morceaux.push(grille.categorieTechnique);
  }
  if (grille.estClasseTENASOSP) {
    morceaux.push('TENASOSP');
  }
  if (grille.estClasseEXETAT) {
    morceaux.push('EXETAT');
  }
  if (grille.estClasseFinaliste) {
    morceaux.push('FINALISTE');
  }
  morceaux.push(grille.obligatoire ? 'obligatoire' : 'optionnel');

  return morceaux.join(' | ');
}

function normaliserDevise(devise: string): TarificationCurrencyCode {
  return devise === 'USD' ? 'USD' : 'CDF';
}

export function mapperTarificationRow(grille: TarificationGridApiData): TarificationGridRow {
  return {
    id: grille.idGrilleTarification,
    libelle: grille.libelle,
    typeFrais: grille.typeFrais,
    montant: grille.montant.montant,
    devise: normaliserDevise(grille.montant.devise),
    section: grille.section ?? 'Toutes sections',
    anneeScolaireId: grille.idAnneeScolaire,
    statut: grille.actif ? 'ACTIVE' : 'INACTIVE',
    regle: construireRegle(grille),
    obligatoire: grille.obligatoire,
    moisScolaire: grille.moisScolaire,
    categorieFraisEtat: grille.categorieFraisEtat,
    categorieTechnique: grille.categorieTechnique,
    trancheFraisEtat: grille.trancheFraisEtat,
    estClasseTENASOSP: grille.estClasseTENASOSP ?? false,
    estClasseEXETAT: grille.estClasseEXETAT ?? false,
    estClasseFinaliste: grille.estClasseFinaliste ?? false,
    dateDebutValidite: grille.dateDebutValidite,
    dateFinValidite: grille.dateFinValidite,
  };
}

export function mapperTarificationFormState(
  idAnneeScolaire: string,
  grille?: TarificationGridApiData,
): TarificationFormState {
  return {
    id: grille?.idGrilleTarification ?? null,
    idAnneeScolaire,
    typeFrais: grille?.typeFrais ?? 'FRAIS_SCOLAIRES',
    libelle: grille?.libelle ?? '',
    montant: grille ? String(grille.montant.montant) : '',
    devise: grille ? normaliserDevise(grille.montant.devise) : 'CDF',
    section: grille?.section ?? '',
    categorieFraisEtat: grille?.categorieFraisEtat ?? '',
    categorieTechnique: grille?.categorieTechnique ?? '',
    estClasseTENASOSP: grille?.estClasseTENASOSP ?? false,
    estClasseEXETAT: grille?.estClasseEXETAT ?? false,
    estClasseFinaliste: grille?.estClasseFinaliste ?? false,
    moisScolaire: grille?.moisScolaire ?? '',
    trancheFraisEtat: grille?.trancheFraisEtat ?? '',
    obligatoire: grille?.obligatoire ?? true,
    actif: grille?.actif ?? true,
    dateDebutValidite: grille?.dateDebutValidite ?? '',
    dateFinValidite: grille?.dateFinValidite ?? '',
  };
}

export function mapperTarificationRequest(formulaire: TarificationFormState): TarificationGridRequest {
  return {
    idAnneeScolaire: formulaire.idAnneeScolaire,
    typeFrais: formulaire.typeFrais,
    libelle: formulaire.libelle.trim(),
    montant: {
      montant: Number.parseInt(formulaire.montant, 10),
      devise: formulaire.devise,
    },
    section: formulaire.section.trim().length > 0 ? formulaire.section.trim() : undefined,
    categorieFraisEtat: formulaire.categorieFraisEtat || undefined,
    categorieTechnique: formulaire.categorieTechnique || undefined,
    estClasseTENASOSP: formulaire.estClasseTENASOSP,
    estClasseEXETAT: formulaire.estClasseEXETAT,
    estClasseFinaliste: formulaire.estClasseFinaliste,
    moisScolaire: formulaire.moisScolaire || undefined,
    trancheFraisEtat: formulaire.trancheFraisEtat || undefined,
    obligatoire: formulaire.obligatoire,
    actif: formulaire.actif,
    dateDebutValidite: formulaire.dateDebutValidite.trim().length > 0 ? formulaire.dateDebutValidite : undefined,
    dateFinValidite: formulaire.dateFinValidite.trim().length > 0 ? formulaire.dateFinValidite : undefined,
  };
}
