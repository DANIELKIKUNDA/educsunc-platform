import { ActiverAnneeScolaireEntree } from '../../../application/dto/input/ActiverAnneeScolaireEntree';
import { ArchiverAnneeScolaireEntree } from '../../../application/dto/input/ArchiverAnneeScolaireEntree';
import { CloturerAnneeScolaireEntree } from '../../../application/dto/input/CloturerAnneeScolaireEntree';
import { ConsulterAnneeScolaireEntree } from '../../../application/dto/input/ConsulterAnneeScolaireEntree';
import { CreerAnneeScolaireEntree } from '../../../application/dto/input/CreerAnneeScolaireEntree';
import { ListerAnneesScolairesParEcoleEntree } from '../../../application/dto/input/ListerAnneesScolairesParEcoleEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes annees scolaires.
export class ValidateurAnneeScolaireHttp {
  // Cette methode valide la requete HTTP de creation d'une annee scolaire.
  public static validerCreation(corps: unknown): CreerAnneeScolaireEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        code: true,
        libelle: true,
        dateDebut: true,
        dateFin: true,
        creePar: true,
      },
      'creation-annee-scolaire',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      dateDebut: OutilsValidationHttpReferentielAcademique.lireDateRequise(
        donnees,
        'dateDebut',
      ),
      dateFin: OutilsValidationHttpReferentielAcademique.lireDateRequise(donnees, 'dateFin'),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des annees scolaires d'une ecole.
  public static validerListe(
    query: unknown,
  ): ListerAnneesScolairesParEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode valide la requete HTTP de consultation d'une annee scolaire.
  public static validerConsultation(
    parametres: unknown,
  ): ConsulterAnneeScolaireEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'id',
      ),
    };
  }

  // Cette methode valide la requete HTTP d'activation d'une annee scolaire.
  public static validerActivation(
    parametres: unknown,
    corps: unknown,
  ): ActiverAnneeScolaireEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { modifiePar: true },
      'activation-annee-scolaire',
    );

    return {
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de cloture d'une annee scolaire.
  public static validerCloture(
    parametres: unknown,
    corps: unknown,
  ): CloturerAnneeScolaireEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { modifiePar: true },
      'cloture-annee-scolaire',
    );

    return {
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP d'archivage d'une annee scolaire.
  public static validerArchivage(
    parametres: unknown,
    corps: unknown,
  ): ArchiverAnneeScolaireEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { modifiePar: true },
      'archivage-annee-scolaire',
    );

    return {
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }
}
