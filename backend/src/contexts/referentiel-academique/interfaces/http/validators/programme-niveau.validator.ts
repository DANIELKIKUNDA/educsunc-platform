import { ArchiverProgrammeNiveauEntree } from '../../../application/dto/input/ArchiverProgrammeNiveauEntree';
import { ConsulterProgrammeNiveauEntree } from '../../../application/dto/input/ConsulterProgrammeNiveauEntree';
import { InitialiserProgrammeNiveauEntree } from '../../../application/dto/input/InitialiserProgrammeNiveauEntree';
import { ListerProgrammesNiveauParEcoleEtAnneeEntree } from '../../../application/dto/input/ListerProgrammesNiveauParEcoleEtAnneeEntree';
import { ValiderProgrammeNiveauEntree } from '../../../application/dto/input/ValiderProgrammeNiveauEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de programmes niveau.
export class ValidateurProgrammeNiveauHttp {
  // Cette methode valide la requete HTTP d'initialisation d'un programme niveau.
  public static validerInitialisation(
    corps: unknown,
  ): InitialiserProgrammeNiveauEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        idAnneeScolaire: true,
        idClasseAcademique: true,
        idReferentielProgramme: true,
        idVersionReferentielProgramme: true,
        creePar: true,
      },
      'initialisation-programme-niveau',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
      idClasseAcademique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idClasseAcademique',
      ),
      idReferentielProgramme: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idReferentielProgramme',
      ),
      idVersionReferentielProgramme: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idVersionReferentielProgramme',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de consultation d'un programme niveau.
  public static validerConsultation(
    parametres: unknown,
  ): ConsulterProgrammeNiveauEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idProgrammeNiveau: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'id',
      ),
    };
  }

  // Cette methode valide la requete HTTP de validation d'un programme niveau.
  public static validerValidation(
    parametres: unknown,
    corps: unknown,
  ): ValiderProgrammeNiveauEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { validePar: true },
      'validation-programme-niveau',
    );

    return {
      idProgrammeNiveau: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      validePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'validePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP d'archivage d'un programme niveau.
  public static validerArchivage(
    parametres: unknown,
    corps: unknown,
  ): ArchiverProgrammeNiveauEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { archivePar: true },
      'archivage-programme-niveau',
    );

    return {
      idProgrammeNiveau: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      archivePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'archivePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des programmes niveau.
  public static validerListe(
    query: unknown,
  ): ListerProgrammesNiveauParEcoleEtAnneeEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idAnneeScolaire',
      ),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
