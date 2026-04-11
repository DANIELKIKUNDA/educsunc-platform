import { CreerOrganisationEntree } from '../../../application/dto/input/CreerOrganisationEntree';
import { ConsulterOrganisationEntree } from '../../../application/dto/input/ConsulterOrganisationEntree';
import { ListerOrganisationsEntree } from '../../../application/dto/input/ListerOrganisationsEntree';
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
}
