import { UseCase } from '../../../../../shared/application/UseCase';
import { OptionEtude } from '../../../domain/aggregates/OptionEtude';
import { ErreurOptionEtudeDupliquee } from '../../../domain/exceptions/ErreurOptionEtudeDupliquee';
import { ErreurOptionEtudeInvalide } from '../../../domain/exceptions/ErreurOptionEtudeInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOptionEtude } from '../../../domain/repositories/DepotOptionEtude';
import { CodeOption } from '../../../domain/value-objects/CodeOption';
import { OptionEtudeId } from '../../../domain/value-objects/OptionEtudeId';
import {
  EnregistrementOptionEtudeJson,
  ImporterOptionsDepuisJsonEntree,
} from '../../dto/input/ImporterOptionsDepuisJsonEntree';
import { OptionEtudeSortie } from '../../dto/output/OptionEtudeSortie';
import { OptionEtudeApplicationMapper } from '../../mappers/OptionEtudeApplicationMapper';

// Cette interface represente la sortie du cas d'usage ImporterOptionsDepuisJson.
export interface SortieImporterOptionsDepuisJson {
  optionsEtude: OptionEtudeSortie[];
  nombreImporte: number;
}

// Ce cas d'usage orchestre l'import des options depuis une source JSON validee.
export class ImporterOptionsDepuisJson
  implements UseCase<ImporterOptionsDepuisJsonEntree, SortieImporterOptionsDepuisJson>
{
  private readonly depotOptionEtude: DepotOptionEtude;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des options d'etude.
  constructor(
    depotOptionEtude: DepotOptionEtude,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotOptionEtude = depotOptionEtude;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe des options d'etude a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterOptionsDepuisJsonEntree,
  ): Promise<SortieImporterOptionsDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const optionsEtude: OptionEtudeSortie[] = [];
    let nombreImporte = 0;

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_OPTIONS_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.options) {
      const optionExistante = await this.depotOptionEtude.trouverParCode(enregistrement.code);

      if (optionExistante !== null) {
        this.verifierCoherenceOptionExistante(optionExistante, enregistrement);
        optionsEtude.push(OptionEtudeApplicationMapper.versSortie(optionExistante));
        continue;
      }

      const optionEtude = new OptionEtude(
        new OptionEtudeId(),
        new CodeOption(enregistrement.code),
        enregistrement.libelle,
        undefined,
        enregistrement.ordreAffichage,
        enregistrement.abreviation,
        true,
        horodatageImport,
        undefined,
        1,
        enregistrement.estTechnique,
        enregistrement.categorieTechnique ?? null,
      );

      await this.depotOptionEtude.sauvegarder(optionEtude);
      optionsEtude.push(OptionEtudeApplicationMapper.versSortie(optionEtude));
      nombreImporte += 1;
    }

    return {
      optionsEtude,
      nombreImporte,
    };
  }

  private validerEntree(
    entree: ImporterOptionsDepuisJsonEntree,
  ): ImporterOptionsDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOptionEtudeInvalide(
        "L'entree du cas d'usage ImporterOptionsDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.options) || entree.options.length === 0) {
      throw new ErreurOptionEtudeInvalide(
        "L'import des options d'etude exige au moins une option.",
      );
    }

    return {
      options: entree.options.map((option) => this.validerEnregistrement(option)),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    option: EnregistrementOptionEtudeJson,
  ): EnregistrementOptionEtudeJson {
    if (option === null || option === undefined) {
      throw new ErreurOptionEtudeInvalide(
        'Chaque option importee doit etre renseignee.',
      );
    }

    const code = this.validerEntierPositif(option.code, 'code');
    const libelle = this.validerTexteObligatoire(option.libelle, 'libelle');

    const technique = this.validerBooleen(option.estTechnique, 'estTechnique');

    return {
      code,
      libelle,
      estTechnique: technique,
      categorieTechnique: this.validerCoherenceCategorieTechnique(
        technique,
        this.validerCategorieTechniqueOptionnelle(option.categorieTechnique),
      ),
      abreviation: this.validerTexteOptionnel(option.abreviation),
      ordreAffichage: this.validerEntierPositifOptionnel(option.ordreAffichage, 'ordreAffichage'),
    };
  }

  private verifierCoherenceOptionExistante(
    optionExistante: OptionEtude,
    enregistrement: EnregistrementOptionEtudeJson,
  ): void {
    if (
      optionExistante.obtenirLibelle() !== enregistrement.libelle
      || optionExistante.estTechnique() !== enregistrement.estTechnique
      || optionExistante.obtenirCategorieTechnique() !== (enregistrement.categorieTechnique ?? null)
      || optionExistante.obtenirAbreviation() !== enregistrement.abreviation
      || optionExistante.obtenirOrdreAffichage() !== enregistrement.ordreAffichage
    ) {
      throw new ErreurOptionEtudeDupliquee(
        "Une option d'etude avec ce code existe deja avec une definition differente.",
      );
    }
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
    valeur: EnregistrementOptionEtudeJson['categorieTechnique'],
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
