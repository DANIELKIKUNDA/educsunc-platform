import { ArchiverClassePedagogiqueEntree } from '../../../application/dto/input/ArchiverClassePedagogiqueEntree';
import { CreerClassePedagogiqueEntree } from '../../../application/dto/input/CreerClassePedagogiqueEntree';
import { DesactiverClassePedagogiqueEntree } from '../../../application/dto/input/DesactiverClassePedagogiqueEntree';
import { ListerClassesPedagogiquesParEcoleEtAnneeEntree } from '../../../application/dto/input/ListerClassesPedagogiquesParEcoleEtAnneeEntree';
import { ConsulterReglesFraisClasseEntree } from '../../../application/use-cases/structure/ConsulterReglesFraisClasse';
import { RenommerClassePedagogiqueEntree } from '../../../application/dto/input/RenommerClassePedagogiqueEntree';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes de classes pedagogiques.
export class ValidateurClassePedagogiqueHttp {
  // Cette methode valide la requete HTTP de creation d'une classe pedagogique.
  public static validerCreation(
    corps: unknown,
  ): CreerClassePedagogiqueEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        idEcole: true,
        idAnneeScolaire: true,
        idClasseAcademique: true,
        code: true,
        libelle: true,
        creePar: true,
      },
      'creation-classe-pedagogique',
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
      code: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donnees, 'code'),
      libelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'libelle',
      ),
      suffixeParallele: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'suffixeParallele',
      ),
      capaciteAccueil: OutilsValidationHttpReferentielAcademique.lireNombreEntierOptionnel(
        donnees,
        'capaciteAccueil',
      ),
      creePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donnees,
        'creePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de liste des classes pedagogiques.
  public static validerListe(
    query: unknown,
  ): ListerClassesPedagogiquesParEcoleEtAnneeEntree {
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

  // Cette methode valide la consultation des faits de frais d'une classe pedagogique.
  public static validerConsultationReglesFrais(
    parametres: unknown,
  ): ConsulterReglesFraisClasseEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
    };
  }

  // Cette methode valide la requete HTTP de renommage d'une classe pedagogique.
  public static validerRenommage(
    parametres: unknown,
    corps: unknown,
  ): RenommerClassePedagogiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        nouveauLibelle: true,
        modifiePar: true,
      },
      'renommage-classe-pedagogique',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      nouveauLibelle: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'nouveauLibelle',
      ),
      modifiePar: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesCorps,
        'modifiePar',
      ),
    };
  }

  // Cette methode valide la requete HTTP de desactivation d'une classe pedagogique.
  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
  ): DesactiverClassePedagogiqueEntree {
    return this.validerChangementStatut(parametres, corps);
  }

  // Cette methode valide la requete HTTP d'archivage d'une classe pedagogique.
  public static validerArchivage(
    parametres: unknown,
    corps: unknown,
  ): ArchiverClassePedagogiqueEntree {
    return this.validerChangementStatut(parametres, corps);
  }

  private static validerChangementStatut(
    parametres: unknown,
    corps: unknown,
  ): DesactiverClassePedagogiqueEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      { modifiePar: true },
      'changement-statut-classe-pedagogique',
    );

    return {
      idClassePedagogique: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
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
