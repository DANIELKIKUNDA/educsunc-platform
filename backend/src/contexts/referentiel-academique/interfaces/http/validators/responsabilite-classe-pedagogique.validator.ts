import { AttribuerResponsableClassePedagogiqueEntree } from '../../../application/dto/input/AttribuerResponsableClassePedagogiqueEntree';
import { ConsulterResponsableClassePedagogiqueEntree } from '../../../application/dto/input/ConsulterResponsableClassePedagogiqueEntree';
import { RetirerResponsableClassePedagogiqueEntree } from '../../../application/dto/input/RetirerResponsableClassePedagogiqueEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des responsabilites de classes pedagogiques.
export class ValidateurResponsabiliteClassePedagogiqueHttp {
  public static validerAttribution(
    parametres: unknown,
    corps: unknown,
  ): AttribuerResponsableClassePedagogiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        idUtilisateurEnseignant: true,
        creePar: true,
      },
      'attribution-responsable-classe-pedagogique',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      idUtilisateurEnseignant: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'idUtilisateurEnseignant',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'creePar',
      ),
    };
  }

  public static validerRetrait(
    parametres: unknown,
  ): RetirerResponsableClassePedagogiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'idAnneeScolaire',
      ),
    };
  }

  public static validerConsultation(
    parametres: unknown,
  ): ConsulterResponsableClassePedagogiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      idAnneeScolaire: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'idAnneeScolaire',
      ),
    };
  }
}
