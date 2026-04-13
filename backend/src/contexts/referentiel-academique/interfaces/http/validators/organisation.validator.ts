import { ActiverOrganisationEntree } from '../../../application/dto/input/ActiverOrganisationEntree';
import { CreerOrganisationEntree } from '../../../application/dto/input/CreerOrganisationEntree';
import { ConsulterOrganisationEntree } from '../../../application/dto/input/ConsulterOrganisationEntree';
import { DesactiverOrganisationEntree } from '../../../application/dto/input/DesactiverOrganisationEntree';
import { ListerOrganisationsEntree } from '../../../application/dto/input/ListerOrganisationsEntree';
import { RenommerOrganisationEntree } from '../../../application/dto/input/RenommerOrganisationEntree';
import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes organisations.
export class ValidateurOrganisationHttp {
  // Cette methode valide la requete HTTP de creation d'une organisation.
  public static validerCreation(corps: unknown): CreerOrganisationEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        code: true,
        nom: true,
        typeOrganisation: true,
        creePar: true,
      },
      'creation-organisation',
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      nom: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'nom'),
      typeOrganisation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donnees,
        'typeOrganisation',
        TypeOrganisation,
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
      description: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'description',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste paginee des organisations.
  public static validerListe(query: unknown): ListerOrganisationsEntree {
    return OutilsValidationHttpReferentielAcademique.lirePagination(query);
  }

  // Cette methode valide la requete HTTP de consultation d'une organisation.
  public static validerConsultation(parametres: unknown): ConsulterOrganisationEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'id',
      ),
    };
  }

  // Cette methode valide la requete HTTP de renommage d'une organisation.
  public static validerRenommage(
    parametres: unknown,
    corps: unknown,
  ): RenommerOrganisationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        nouveauNom: true,
        modifiePar: true,
      },
      'renommage-organisation',
    );

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      nouveauNom: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'nouveauNom',
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP d'activation d'une organisation.
  public static validerActivation(
    parametres: unknown,
    corps: unknown,
  ): ActiverOrganisationEntree {
    return this.validerChangementStatut(parametres, corps);
  }

  // Cette methode valide la requete HTTP de desactivation d'une organisation.
  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
  ): DesactiverOrganisationEntree {
    return this.validerChangementStatut(parametres, corps);
  }

  private static validerChangementStatut(
    parametres: unknown,
    corps: unknown,
  ): ActiverOrganisationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { modifiePar: true },
      'changement-statut-organisation',
    );

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
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
