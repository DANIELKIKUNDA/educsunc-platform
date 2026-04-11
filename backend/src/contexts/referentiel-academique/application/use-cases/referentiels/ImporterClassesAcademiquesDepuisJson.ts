import { UseCase } from '../../../../../shared/application/UseCase';
import { ClasseAcademique } from '../../../domain/aggregates/ClasseAcademique';
import { OptionEtude } from '../../../domain/aggregates/OptionEtude';
import { SectionScolaire } from '../../../domain/aggregates/SectionScolaire';
import { ErreurClasseAcademiqueDupliquee } from '../../../domain/exceptions/ErreurClasseAcademiqueDupliquee';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurOptionEtudeInvalide } from '../../../domain/exceptions/ErreurOptionEtudeInvalide';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotOptionEtude } from '../../../domain/repositories/DepotOptionEtude';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { MoteurStructureScolaire } from '../../../domain/services/MoteurStructureScolaire';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { OptionEtudeId } from '../../../domain/value-objects/OptionEtudeId';
import { OrdreClasse } from '../../../domain/value-objects/OrdreClasse';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import {
  EnregistrementClasseAcademiqueJson,
  ImporterClassesAcademiquesDepuisJsonEntree,
} from '../../dto/input/ImporterClassesAcademiquesDepuisJsonEntree';
import { ClasseAcademiqueSortie } from '../../dto/output/ClasseAcademiqueSortie';
import { ClasseAcademiqueApplicationMapper } from '../../mappers/ClasseAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage ImporterClassesAcademiquesDepuisJson.
export interface SortieImporterClassesAcademiquesDepuisJson {
  classesAcademiques: ClasseAcademiqueSortie[];
  nombreImporte: number;
}

// Ce cas d'usage orchestre l'import des classes academiques depuis une source JSON validee.
export class ImporterClassesAcademiquesDepuisJson
  implements UseCase<
    ImporterClassesAcademiquesDepuisJsonEntree,
    SortieImporterClassesAcademiquesDepuisJson
  >
{
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly depotSectionScolaire: DepotSectionScolaire;
  private readonly depotOptionEtude: DepotOptionEtude;
  private readonly moteurStructureScolaire: MoteurStructureScolaire;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des classes academiques.
  constructor(
    depotClasseAcademique: DepotClasseAcademique,
    depotSectionScolaire: DepotSectionScolaire,
    depotOptionEtude: DepotOptionEtude,
    moteurStructureScolaire: MoteurStructureScolaire = new MoteurStructureScolaire(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotClasseAcademique = depotClasseAcademique;
    this.depotSectionScolaire = depotSectionScolaire;
    this.depotOptionEtude = depotOptionEtude;
    this.moteurStructureScolaire = moteurStructureScolaire;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe des classes academiques a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterClassesAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterClassesAcademiquesDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const classesAcademiques: ClasseAcademiqueSortie[] = [];
    let nombreImporte = 0;

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_CLASSES_ACADEMIQUES_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.classesAcademiques) {
      const sectionScolaire = await this.obtenirSectionScolaire(enregistrement.idSectionScolaire);
      const optionEtude = await this.obtenirOptionEtudeOptionnelle(enregistrement.idOptionEtude);
      const classeAcademiqueExistante = await this.depotClasseAcademique.trouverParCode(
        enregistrement.code,
      );

      if (classeAcademiqueExistante !== null) {
        this.verifierCoherenceClasseExistante(classeAcademiqueExistante, enregistrement);
        classesAcademiques.push(ClasseAcademiqueApplicationMapper.versSortie(classeAcademiqueExistante));
        continue;
      }

      const classeAcademique = new ClasseAcademique(
        new ClasseAcademiqueId(),
        sectionScolaire.obtenirId(),
        enregistrement.code,
        enregistrement.libelle,
        new OrdreClasse(enregistrement.ordrePedagogique),
        enregistrement.cycle,
        enregistrement.accepteOptions,
        enregistrement.optionObligatoire,
        enregistrement.typeStructureEvaluation,
        optionEtude?.obtenirId(),
      );

      this.moteurStructureScolaire.validerStructurePedagogique(
        sectionScolaire,
        classeAcademique,
        optionEtude ?? undefined,
      );

      await this.depotClasseAcademique.sauvegarder(classeAcademique);
      classesAcademiques.push(ClasseAcademiqueApplicationMapper.versSortie(classeAcademique));
      nombreImporte += 1;
    }

    return {
      classesAcademiques,
      nombreImporte,
    };
  }

  private validerEntree(
    entree: ImporterClassesAcademiquesDepuisJsonEntree,
  ): ImporterClassesAcademiquesDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'entree du cas d'usage ImporterClassesAcademiquesDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.classesAcademiques) || entree.classesAcademiques.length === 0) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'import des classes academiques exige au moins une classe.",
      );
    }

    return {
      classesAcademiques: entree.classesAcademiques.map((classeAcademique) => (
        this.validerEnregistrement(classeAcademique)
      )),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    classeAcademique: EnregistrementClasseAcademiqueJson,
  ): EnregistrementClasseAcademiqueJson {
    if (classeAcademique === null || classeAcademique === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        'Chaque classe academique importee doit etre renseignee.',
      );
    }

    return {
      idSectionScolaire: this.validerTexteObligatoire(classeAcademique.idSectionScolaire, 'idSectionScolaire'),
      idOptionEtude: this.validerTexteOptionnel(classeAcademique.idOptionEtude),
      code: this.validerTexteObligatoire(classeAcademique.code, 'code'),
      libelle: this.validerTexteObligatoire(classeAcademique.libelle, 'libelle'),
      ordrePedagogique: this.validerEntierPositif(classeAcademique.ordrePedagogique, 'ordrePedagogique'),
      cycle: this.validerTexteObligatoire(classeAcademique.cycle, 'cycle'),
      accepteOptions: this.validerBooleen(classeAcademique.accepteOptions, 'accepteOptions'),
      optionObligatoire: this.validerBooleen(classeAcademique.optionObligatoire, 'optionObligatoire'),
      typeStructureEvaluation: this.validerTypeStructureEvaluation(
        classeAcademique.typeStructureEvaluation,
      ),
    };
  }

  private async obtenirSectionScolaire(idSectionScolaire: string): Promise<SectionScolaire> {
    const sectionScolaire = await this.depotSectionScolaire.trouverParId(
      new SectionScolaireId(idSectionScolaire),
    );

    if (sectionScolaire === null) {
      throw new ErreurSectionScolaireInvalide(
        "La section scolaire referencee est introuvable.",
      );
    }

    return sectionScolaire;
  }

  private async obtenirOptionEtudeOptionnelle(idOptionEtude?: string): Promise<OptionEtude | undefined> {
    if (idOptionEtude === undefined) {
      return undefined;
    }

    const optionEtude = await this.depotOptionEtude.trouverParId(new OptionEtudeId(idOptionEtude));

    if (optionEtude === null) {
      throw new ErreurOptionEtudeInvalide(
        "L'option d'etude referencee est introuvable.",
      );
    }

    return optionEtude;
  }

  private verifierCoherenceClasseExistante(
    classeExistante: ClasseAcademique,
    enregistrement: EnregistrementClasseAcademiqueJson,
  ): void {
    if (
      !classeExistante.obtenirSectionScolaireId().estEgal(new SectionScolaireId(enregistrement.idSectionScolaire))
      || classeExistante.obtenirOptionEtudeId()?.obtenirValeur() !== enregistrement.idOptionEtude
      || classeExistante.obtenirLibelle() !== enregistrement.libelle
      || classeExistante.obtenirOrdrePedagogiqueNumerique() !== enregistrement.ordrePedagogique
      || classeExistante.obtenirCycle() !== enregistrement.cycle
      || classeExistante.accepteOptionsEtude() !== enregistrement.accepteOptions
      || classeExistante.estOptionObligatoire() !== enregistrement.optionObligatoire
      || classeExistante.obtenirTypeStructureEvaluation() !== enregistrement.typeStructureEvaluation
    ) {
      throw new ErreurClasseAcademiqueDupliquee(
        'Une classe academique avec ce code existe deja avec une definition differente.',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurClasseAcademiqueInvalide(
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
      throw new ErreurClasseAcademiqueInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre un booleen.`,
      );
    }

    return valeur;
  }

  private validerTypeStructureEvaluation(
    valeur: TypeStructureEvaluation,
  ): TypeStructureEvaluation {
    if (!Object.values(TypeStructureEvaluation).includes(valeur)) {
      throw new ErreurClasseAcademiqueInvalide(
        "Le type de structure d'evaluation est invalide.",
      );
    }

    return valeur;
  }
}
