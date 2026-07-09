import { ActiverOrganisationEntree } from '../../../application/dto/input/ActiverOrganisationEntree';
import { CreerOrganisationEntree } from '../../../application/dto/input/CreerOrganisationEntree';
import { ConsulterOrganisationEntree } from '../../../application/dto/input/ConsulterOrganisationEntree';
import { DesactiverOrganisationEntree } from '../../../application/dto/input/DesactiverOrganisationEntree';
import { ListerOrganisationsEntree } from '../../../application/dto/input/ListerOrganisationsEntree';
import { MettreAJourOrganisationEntree } from '../../../application/dto/input/MettreAJourOrganisationEntree';
import { RenommerOrganisationEntree } from '../../../application/dto/input/RenommerOrganisationEntree';
import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';
import { OutilsValidationHttpReferentielAcademique } from './OutilsValidationHttpReferentielAcademique';

// Ce validateur gere la validation HTTP des routes organisations.
export class ValidateurOrganisationHttp {
  // Cette methode valide la requete HTTP de creation d'une organisation.
  public static validerCreation(corps: unknown, creePar: string): CreerOrganisationEntree {
    const donnees = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donnees,
      {
        code: true,
        nom: true,
        typeOrganisation: true,
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
      creePar,
      description: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donnees,
        'description',
      ),
      promoteurPrincipal: this.lirePromoteurPrincipal(donnees),
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
    modifiePar: string,
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
      modifiePar,
    };
  }

  // Cette methode valide la requete HTTP de mise a jour complete d une organisation.
  public static validerMiseAJour(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): MettreAJourOrganisationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    const donneesCorps = OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    OutilsValidationHttpReferentielAcademique.validerChampsRequis(
      donneesCorps,
      {
        nom: true,
        typeOrganisation: true,
      },
      'mise-a-jour-organisation',
    );

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      nom: OutilsValidationHttpReferentielAcademique.lireChaineRequise(donneesCorps, 'nom'),
      typeOrganisation: OutilsValidationHttpReferentielAcademique.lireEnumRequis(
        donneesCorps,
        'typeOrganisation',
        TypeOrganisation,
      ),
      description: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        donneesCorps,
        'description',
      ),
      modifiePar,
      promoteurPrincipal: this.lirePromoteurPrincipalSansMotDePasse(donneesCorps),
    };
  }

  // Cette methode valide la requete HTTP d'activation d'une organisation.
  public static validerActivation(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): ActiverOrganisationEntree {
    return this.validerChangementStatut(parametres, corps, modifiePar);
  }

  // Cette methode valide la requete HTTP de desactivation d'une organisation.
  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): DesactiverOrganisationEntree {
    return this.validerChangementStatut(parametres, corps, modifiePar);
  }

  private static validerChangementStatut(
    parametres: unknown,
    corps: unknown,
    modifiePar: string,
  ): ActiverOrganisationEntree {
    const donneesParametres = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      parametres,
      'parametres',
    );
    OutilsValidationHttpReferentielAcademique.obtenirObjet(corps, 'corps');

    return {
      idOrganisation: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        donneesParametres,
        'id',
      ),
      modifiePar,
    };
  }

  private static lirePromoteurPrincipal(
    donnees: Record<string, unknown>,
  ): CreerOrganisationEntree['promoteurPrincipal'] {
    if (donnees.promoteurPrincipal === undefined || donnees.promoteurPrincipal === null) {
      return undefined;
    }

    const promoteur = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      donnees.promoteurPrincipal,
      'promoteurPrincipal',
    );

    return {
      nomComplet: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        promoteur,
        'nomComplet',
      ),
      email: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        promoteur,
        'email',
      ),
      telephone: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        promoteur,
        'telephone',
      ),
      identifiant: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        promoteur,
        'identifiant',
      ),
      motDePasseInitial: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        promoteur,
        'motDePasseInitial',
      ),
    };
  }

  private static lirePromoteurPrincipalSansMotDePasse(
    donnees: Record<string, unknown>,
  ): MettreAJourOrganisationEntree['promoteurPrincipal'] {
    if (donnees.promoteurPrincipal === undefined || donnees.promoteurPrincipal === null) {
      return undefined;
    }

    const promoteur = OutilsValidationHttpReferentielAcademique.obtenirObjet(
      donnees.promoteurPrincipal,
      'promoteurPrincipal',
    );

    return {
      nomComplet: OutilsValidationHttpReferentielAcademique.lireChaineRequise(
        promoteur,
        'nomComplet',
      ),
      email: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        promoteur,
        'email',
      ),
      telephone: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        promoteur,
        'telephone',
      ),
      identifiant: OutilsValidationHttpReferentielAcademique.lireChaineOptionnelle(
        promoteur,
        'identifiant',
      ),
    };
  }
}
