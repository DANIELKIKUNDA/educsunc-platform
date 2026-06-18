import { ActiverEcoleEntree } from '../../../application/dto/input/ActiverEcoleEntree';
import { ChangerModeExploitationEcoleEntree } from '../../../application/dto/input/ChangerModeExploitationEcoleEntree';
import { ConsulterEcoleEntree } from '../../../application/dto/input/ConsulterEcoleEntree';
import { CreerEcoleEntree } from '../../../application/dto/input/CreerEcoleEntree';
import { DesactiverEcoleEntree } from '../../../application/dto/input/DesactiverEcoleEntree';
import { ListerEcolesParOrganisationEntree } from '../../../application/dto/input/ListerEcolesParOrganisationEntree';
import { RenommerEcoleEntree } from '../../../application/dto/input/RenommerEcoleEntree';
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
  public static validerCreation(corps: unknown, creePar: string): CreerEcoleEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idOrganisation: true,
        code: true,
        nom: true,
        modeExploitation: true,
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
      creePar,
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
    modifiePar: string,
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
      modifiePar,
    };
  }

  // Cette methode valide la requete HTTP de renommage d'une ecole.
  public static validerRenommage(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): RenommerEcoleEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        nouveauNom: true,
      },
      'renommage-ecole',
    );

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      nouveauNom: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'nouveauNom',
      ),
      modifiePar,
    };
  }

  // Cette methode valide la requete HTTP d'activation d'une ecole.
  public static validerActivation(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): ActiverEcoleEntree {
    return this.validerChangementStatut(parametres, corps, modifiePar);
  }

  // Cette methode valide la requete HTTP de desactivation d'une ecole.
  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): DesactiverEcoleEntree {
    return this.validerChangementStatut(parametres, corps, modifiePar);
  }

  private static validerChangementStatut(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): ActiverEcoleEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    return {
      idEcole: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      modifiePar,
    };
  }
}
