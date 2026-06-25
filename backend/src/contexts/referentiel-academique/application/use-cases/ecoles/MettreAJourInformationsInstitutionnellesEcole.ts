import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { MettreAJourInformationsInstitutionnellesEcoleEntree } from '../../dto/input/MettreAJourInformationsInstitutionnellesEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Cette interface represente la sortie du cas d'usage de mise a jour institutionnelle d'une ecole.
export interface SortieMettreAJourInformationsInstitutionnellesEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre la mise a jour des informations institutionnelles d'une ecole existante.
export class MettreAJourInformationsInstitutionnellesEcole
  implements
    UseCase<
      MettreAJourInformationsInstitutionnellesEcoleEntree,
      SortieMettreAJourInformationsInstitutionnellesEcole
    >
{
  private readonly depotEcole: DepotEcole;
  private readonly policyAudit: PolicyAudit;

  constructor(
    depotEcole: DepotEcole,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotEcole = depotEcole;
    this.policyAudit = policyAudit;
  }

  public async executer(
    entree: MettreAJourInformationsInstitutionnellesEcoleEntree,
  ): Promise<SortieMettreAJourInformationsInstitutionnellesEcole> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'METTRE_A_JOUR_INFORMATIONS_INSTITUTIONNELLES_ECOLE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole a mettre a jour est introuvable.",
      );
    }

    ecole.mettreAJourInformationsInstitutionnelles(
      {
        sigle: entreeValidee.sigle ?? ecole.obtenirSigle(),
        adresse: entreeValidee.adresse ?? ecole.obtenirAdresse(),
        telephone: entreeValidee.telephone ?? ecole.obtenirTelephone(),
        email: entreeValidee.email ?? ecole.obtenirEmail(),
        provinceEducationnelle:
          entreeValidee.provinceEducationnelle ?? ecole.obtenirProvinceEducationnelle(),
        ville: entreeValidee.ville ?? ecole.obtenirVille(),
        communeOuTerritoire:
          entreeValidee.communeOuTerritoire ?? ecole.obtenirCommuneOuTerritoire(),
      },
      entreeValidee.modifiePar,
    );
    await this.depotEcole.sauvegarder(ecole);

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(
    entree: MettreAJourInformationsInstitutionnellesEcoleEntree,
  ): MettreAJourInformationsInstitutionnellesEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage MettreAJourInformationsInstitutionnellesEcole est obligatoire.",
      );
    }

    const sortie = {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
      sigle: this.validerTexteOptionnel(entree.sigle),
      adresse: this.validerTexteOptionnel(entree.adresse),
      telephone: this.validerTexteOptionnel(entree.telephone),
      email: this.validerTexteOptionnel(entree.email),
      provinceEducationnelle: this.validerTexteOptionnel(entree.provinceEducationnelle),
      ville: this.validerTexteOptionnel(entree.ville),
      communeOuTerritoire: this.validerTexteOptionnel(entree.communeOuTerritoire),
    };

    if (
      sortie.sigle === undefined
      && sortie.adresse === undefined
      && sortie.telephone === undefined
      && sortie.email === undefined
      && sortie.provinceEducationnelle === undefined
      && sortie.ville === undefined
      && sortie.communeOuTerritoire === undefined
    ) {
      throw new ErreurEcoleInvalide(
        'Au moins une information institutionnelle doit etre fournie.',
      );
    }

    return sortie;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurEcoleInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();
    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }
}
