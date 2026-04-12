import type { Pagination } from '../../../../../shared/application/Pagination';
import { CreerOptionEtudeEntree } from '../../../application/dto/input/CreerOptionEtudeEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes d'options d'etude.
export class ValidateurOptionEtudeHttp {
  // Cette methode valide la requete HTTP de creation d'une option d'etude.
  public static validerCreation(corps: unknown): CreerOptionEtudeEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        code: true,
        libelle: true,
        creePar: true,
      },
      'creation-option-etude',
    );

    return {
      code: OutilsValidationHttpReferentielAcademique.lireNombreEntierRequis(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      typeOption: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'typeOption',
      ),
      abreviation: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'abreviation',
      ),
      ordreAffichage: OutilsValidationHttpReferentielAcademique.lireNombreEntierOptionnel(
        donnees,
        'ordreAffichage',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des options d'etude.
  public static validerListe(query: unknown): Pagination {
    return OutilsValidationHttpReferentielAcademique.lirePagination(query);
  }
}
