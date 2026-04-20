import { ConsulterCalendrierAcademiqueEntree } from '../../../application/dto/input/ConsulterCalendrierAcademiqueEntree';
import { ConsulterCalendrierParEcoleEtAnneeEntree } from '../../../application/dto/input/ConsulterCalendrierParEcoleEtAnneeEntree';
import { CreerCalendrierAcademiqueEntree } from '../../../application/dto/input/CreerCalendrierAcademiqueEntree';
import { PeriodeCalendrierEntree } from '../../../application/dto/input/PeriodeCalendrierEntree';
import { ValiderCalendrierAcademiqueEntree } from '../../../application/dto/input/ValiderCalendrierAcademiqueEntree';
import { VerrouillerCalendrierAcademiqueEntree } from '../../../application/dto/input/VerrouillerCalendrierAcademiqueEntree';
import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Cette interface represente la charge HTTP validee de modification d'une periode.
export interface EntreeModificationPeriodeCalendrierHttp {
  idCalendrierAcademique: string;
  codePeriode: string;
  periode: PeriodeCalendrierEntree;
  modifiePar: string;
}

// Ce validateur gere la validation HTTP des routes de calendriers academiques.
export class ValidateurCalendrierAcademiqueHttp {
  // Cette methode valide la requete HTTP de creation d'un calendrier academique.
  public static validerCreation(
    corps: unknown,
  ): CreerCalendrierAcademiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        idAnneeScolaire: true,
        typeStructureEvaluation: true,
        dateDebutAnnee: true,
        dateFinAnnee: true,
        periodes: true,
        creePar: true,
      },
      'creation-calendrier-academique',
    );

    const periodesBrutes = OutilsValidationHttpReferentielAcademique.lireTableauRequis(
      donnees,
      'periodes',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
      typeStructureEvaluation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeStructureEvaluation',
        TypeStructureEvaluation,
      ),
      dateDebutAnnee: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'dateDebutAnnee',
      ),
      dateFinAnnee: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'dateFinAnnee',
      ),
      periodes: periodesBrutes.map((periodeBrute, index) =>
        this.validerPeriode(periodeBrute, `periodes[${index}]`)
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de modification d'une periode de calendrier.
  public static validerModificationPeriode(
    parametres: unknown,
    corps: unknown,
  ): EntreeModificationPeriodeCalendrierHttp {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');
    const codePeriode = OutilsValidationHttpReferentielAcademique.lireChaineRequise(
      donneesParametres,
      'code',
    );
    const modifiePar = OutilsValidationHttpReferentielAcademique.lireChaineRequise(
      donneesCorps,
      'modifiePar',
    );
    const donneesPeriode = Object.prototype.hasOwnProperty.call(donneesCorps, 'periode')
      ? OutilsValidationHttpReferentielAcademique.lireObjetRequis(donneesCorps, 'periode')
      : donneesCorps;
    const periode = this.validerPeriode(donneesPeriode, 'periode', codePeriode);

    if (periode.code !== codePeriode) {
      throw new ValidationError(
        'Le code de la periode du corps doit correspondre au code de la route.',
        'VALIDATION_HTTP_CODE_PERIODE_INCOHERENT',
        {
          codePeriodeRoute: codePeriode,
          codePeriodeCorps: periode.code,
        },
      );
    }

    return {
      idCalendrierAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      codePeriode,
      periode,
      modifiePar,
    };
  }

  // Cette methode valide la requete HTTP de validation d'un calendrier academique.
  public static validerValidation(
    parametres: unknown,
    corps: unknown,
  ): ValiderCalendrierAcademiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { validePar: true },
      'validation-calendrier-academique',
    );

    return {
      idCalendrierAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      validePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'validePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de verrouillage d'un calendrier academique.
  public static validerVerrouillage(
    parametres: unknown,
    corps: unknown,
  ): VerrouillerCalendrierAcademiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { verrouillePar: true },
      'verrouillage-calendrier-academique',
    );

    return {
      idCalendrierAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      verrouillePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'verrouillePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de consultation d'un calendrier academique.
  public static validerConsultation(
    parametres: unknown,
  ): ConsulterCalendrierAcademiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idCalendrierAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'id',
      ),
    };
  }

  // Cette methode valide la consultation du calendrier d'une ecole pour une annee scolaire.
  public static validerConsultationParEcoleEtAnnee(
    query: unknown,
  ): ConsulterCalendrierParEcoleEtAnneeEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
    };
  }

  private static validerPeriode(
    valeur: unknown,
    contexte: string,
    codeParDefaut?: string,
  ): PeriodeCalendrierEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(valeur, contexte);
    const code =
      OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(donnees, 'code')
      ?? codeParDefaut;

    if (code === undefined) {
      throw new ValidationError(
        `Le champ "${contexte}.code" est obligatoire.`,
        'VALIDATION_HTTP_PERIODE_CODE_REQUIS',
      );
    }

    return {
      code,
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      ordre: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'ordre'),
      typePeriode: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typePeriode',
        TypePeriodeCalendrier,
      ),
      dateDebut: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'dateDebut',
      ),
      dateFin: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'dateFin',
      ),
    };
  }
}
