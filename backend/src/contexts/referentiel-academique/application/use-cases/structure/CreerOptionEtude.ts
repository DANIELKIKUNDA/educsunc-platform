import { UseCase } from '../../../../../shared/application/UseCase';
import { OptionEtude } from '../../../domain/aggregates/OptionEtude';
import { ErreurOptionEtudeDupliquee } from '../../../domain/exceptions/ErreurOptionEtudeDupliquee';
import { ErreurOptionEtudeInvalide } from '../../../domain/exceptions/ErreurOptionEtudeInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOptionEtude } from '../../../domain/repositories/DepotOptionEtude';
import { CodeOption } from '../../../domain/value-objects/CodeOption';
import { OptionEtudeId } from '../../../domain/value-objects/OptionEtudeId';
import { CreerOptionEtudeEntree } from '../../dto/input/CreerOptionEtudeEntree';
import { OptionEtudeSortie } from '../../dto/output/OptionEtudeSortie';
import { OptionEtudeApplicationMapper } from '../../mappers/OptionEtudeApplicationMapper';

// Cette interface represente la sortie du cas d'usage CreerOptionEtude.
export interface SortieCreerOptionEtude {
  optionEtude: OptionEtudeSortie;
}

// Ce cas d'usage orchestre la creation d'une option d'etude.
export class CreerOptionEtude
  implements UseCase<CreerOptionEtudeEntree, SortieCreerOptionEtude>
{
  private readonly depotOptionEtude: DepotOptionEtude;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une option d'etude.
  constructor(
    depotOptionEtude: DepotOptionEtude,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotOptionEtude = depotOptionEtude;
    this.policyAudit = policyAudit;
  }

  // Cette methode cree une option d'etude officielle.
  public async executer(entree: CreerOptionEtudeEntree): Promise<SortieCreerOptionEtude> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_OPTION_ETUDE',
      entreeValidee.creePar,
      horodatageCreation,
    );

    const optionExistante = await this.depotOptionEtude.trouverParCode(entreeValidee.code);

    if (optionExistante !== null) {
      throw new ErreurOptionEtudeDupliquee(
        'Une option d etude avec ce code existe deja.',
      );
    }

    const optionEtude = new OptionEtude(
      new OptionEtudeId(),
      new CodeOption(entreeValidee.code),
      entreeValidee.libelle,
      entreeValidee.typeOption,
      entreeValidee.ordreAffichage,
      entreeValidee.abreviation,
      true,
      horodatageCreation,
      undefined,
      1,
      entreeValidee.estTechnique,
      entreeValidee.categorieTechnique ?? null,
    );

    await this.depotOptionEtude.sauvegarder(optionEtude);

    return {
      optionEtude: OptionEtudeApplicationMapper.versSortie(optionEtude),
    };
  }

  private validerEntree(entree: CreerOptionEtudeEntree): CreerOptionEtudeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOptionEtudeInvalide(
        "L'entree du cas d'usage CreerOptionEtude est obligatoire.",
      );
    }

    const code = this.validerEntierPositif(entree.code, 'code');
    const libelle = this.validerTexteObligatoire(entree.libelle, 'libelle');

    const technique = this.validerBooleen(entree.estTechnique, 'estTechnique');

    return {
      code,
      libelle,
      typeOption: this.validerTexteOptionnel(entree.typeOption),
      estTechnique: technique,
      categorieTechnique: this.validerCoherenceCategorieTechnique(
        technique,
        this.validerCategorieTechniqueOptionnelle(entree.categorieTechnique),
      ),
      abreviation: this.validerTexteOptionnel(entree.abreviation),
      ordreAffichage: this.validerEntierPositifOptionnel(entree.ordreAffichage, 'ordreAffichage'),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurOptionEtudeInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurOptionEtudeInvalide(
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
      throw new ErreurOptionEtudeInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurOptionEtudeInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerEntierPositifOptionnel(valeur: number | undefined, nomChamp: string): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    return this.validerEntierPositif(valeur, nomChamp);
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ErreurOptionEtudeInvalide(
        `Le champ "${nomChamp}" doit etre un booleen.`,
      );
    }

    return valeur;
  }

  private validerCategorieTechniqueOptionnelle(
    valeur: CreerOptionEtudeEntree['categorieTechnique'],
  ): 'GROUPE_1' | 'GROUPE_2' | null | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (valeur === null || valeur === 'GROUPE_1' || valeur === 'GROUPE_2') {
      return valeur;
    }

    throw new ErreurOptionEtudeInvalide(
      'Le champ "categorieTechnique" doit etre GROUPE_1, GROUPE_2 ou null.',
    );
  }

  private validerCoherenceCategorieTechnique(
    technique: boolean,
    valeurDeclaree: 'GROUPE_1' | 'GROUPE_2' | null | undefined,
  ): 'GROUPE_1' | 'GROUPE_2' | null {
    if (!technique) {
      if (valeurDeclaree !== undefined && valeurDeclaree !== null) {
        throw new ErreurOptionEtudeInvalide(
          'Une option non technique ne doit pas avoir de categorie technique.',
        );
      }

      return null;
    }

    if (valeurDeclaree === undefined || valeurDeclaree === null) {
      throw new ErreurOptionEtudeInvalide(
        'Une option technique doit avoir une categorie technique.',
      );
    }

    return valeurDeclaree;
  }
}
