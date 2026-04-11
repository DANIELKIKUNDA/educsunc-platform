import { ChangerModeExploitationEcoleEntree } from '../../../application/dto/input/ChangerModeExploitationEcoleEntree';
import { ConsulterEcoleEntree } from '../../../application/dto/input/ConsulterEcoleEntree';
import { CreerEcoleEntree } from '../../../application/dto/input/CreerEcoleEntree';
import { ListerEcolesParOrganisationEntree } from '../../../application/dto/input/ListerEcolesParOrganisationEntree';
import type { Pagination } from '../../../../../shared/application/Pagination';
import { ModeExploitation } from '../../../domain/value-objects/ModeExploitation';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Cette interface represente la liste HTTP generique des ecoles.
export interface EntreeListeEcolesHttp extends Pagination {
  idOrganisation?: string;
}

// Ce validateur gere la validation HTTP des routes ecoles.
export class ValidateurEcoleHttp {
  // Cette methode valide la requete HTTP de creation d'une ecole.
  public static validerCreation(corps: unknown): CreerEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idOrganisation: true,
        code: true,
        nom: true,
        modeExploitation: true,
        creePar: true,
      },
      'creation-ecole',
    );

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'idOrganisation',
      ),
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      nom: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'nom'),
      modeExploitation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'modeExploitation',
        ModeExploitation,
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
      sigle: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(donnees, 'sigle'),
      adresse: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'adresse',
      ),
      telephone: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'telephone',
      ),
      email: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'email',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste generique des ecoles.
  public static validerListe(query: unknown): EntreeListeEcolesHttp {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(query, 'query');
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      ...pagination,
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'idOrganisation',
      ),
    };
  }

  // Cette methode valide la requete HTTP de consultation d'une ecole.
  public static validerConsultation(parametres: unknown): ConsulterEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'id'),
    };
  }

  // Cette methode valide la requete HTTP de liste des ecoles d'une organisation.
  public static validerListeParOrganisation(
    parametres: unknown,
    query: unknown,
  ): ListerEcolesParOrganisationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const pagination = OutilsValidationHttpReferentielAcademique.lirePagination(query);

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  // Cette methode valide la requete HTTP de changement de mode d'exploitation d'une ecole.
  public static validerChangementMode(
    parametres: unknown,
    corps: unknown,
  ): ChangerModeExploitationEcoleEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        nouveauModeExploitation: true,
        modifiePar: true,
      },
      'changement-mode-ecole',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      nouveauModeExploitation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donneesCorps,
        'nouveauModeExploitation',
        ModeExploitation,
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }
}
