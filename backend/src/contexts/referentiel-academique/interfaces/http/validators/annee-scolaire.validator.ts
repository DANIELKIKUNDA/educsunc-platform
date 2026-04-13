import { ActiverAnneeScolaireEntree } from '../../../application/dto/input/ActiverAnneeScolaireEntree';
import { ArchiverAnneeScolaireEntree } from '../../../application/dto/input/ArchiverAnneeScolaireEntree';
import { BasculerAnneeScolaireEntree } from '../../../application/dto/input/BasculerAnneeScolaireEntree';
import { CloturerAnneeScolaireEntree } from '../../../application/dto/input/CloturerAnneeScolaireEntree';
import { ConsulterAnneeActiveParEcoleEntree } from '../../../application/dto/input/ConsulterAnneeActiveParEcoleEntree';
import { ConsulterAnneeScolaireEntree } from '../../../application/dto/input/ConsulterAnneeScolaireEntree';
import { CreerAnneeScolaireEntree } from '../../../application/dto/input/CreerAnneeScolaireEntree';
import { GarantirAnneeScolaireActiveParEcoleEntree } from '../../../application/dto/input/GarantirAnneeScolaireActiveParEcoleEntree';
import { ListerAnneesScolairesParEcoleEntree } from '../../../application/dto/input/ListerAnneesScolairesParEcoleEntree';
import { PreparerAnneeScolaireSuivanteEntree } from '../../../application/dto/input/PreparerAnneeScolaireSuivanteEntree';
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

  // Cette methode valide la requete HTTP de consultation de l'annee active d'une ecole.
  public static validerConsultationActive(
    query: unknown,
  ): ConsulterAnneeActiveParEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
    };
  }

  // Cette methode valide la requete HTTP de preparation de l'annee scolaire suivante.
  public static validerPreparationSuivante(
    corps: unknown,
  ): PreparerAnneeScolaireSuivanteEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        creePar: true,
      },
      'preparation-annee-scolaire-suivante',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'creePar'),
      dateDebut: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateDebut',
      ),
      dateFin: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateFin',
      ),
    };
  }

  // Cette methode valide la requete HTTP de garantie d'une annee scolaire active.
  public static validerGarantieActive(
    corps: unknown,
  ): GarantirAnneeScolaireActiveParEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        modifiePar: true,
      },
      'garantie-annee-scolaire-active',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'modifiePar',
      ),
      dateReference: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateReference',
      ),
      dateDebut: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateDebut',
      ),
      dateFin: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateFin',
      ),
    };
  }

  // Cette methode valide la requete HTTP de bascule annuelle.
  public static validerBascule(
    corps: unknown,
  ): BasculerAnneeScolaireEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        modifiePar: true,
      },
      'bascule-annee-scolaire',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'idEcole'),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'modifiePar',
      ),
      creerSuivanteSiAbsente: OutilsValidationHttpReferentielAcademique.lireBooleenOptionnel(
        donnees,
        'creerSuivanteSiAbsente',
      ),
      dateDebutSuivante: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateDebutSuivante',
      ),
      dateFinSuivante: OutilsValidationHttpReferentielAcademique.lireDateOptionnelle(
        donnees,
        'dateFinSuivante',
      ),
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
