import { UseCase } from '../../../../../shared/application/UseCase';
import { ClasseAcademique } from '../../../domain/aggregates/ClasseAcademique';
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
import { CreerClasseAcademiqueEntree } from '../../dto/input/CreerClasseAcademiqueEntree';
import { ClasseAcademiqueSortie } from '../../dto/output/ClasseAcademiqueSortie';
import { ClasseAcademiqueApplicationMapper } from '../../mappers/ClasseAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage CreerClasseAcademique.
export interface SortieCreerClasseAcademique {
  classeAcademique: ClasseAcademiqueSortie;
}

// Ce cas d'usage orchestre la creation d'une classe academique.
export class CreerClasseAcademique
  implements UseCase<CreerClasseAcademiqueEntree, SortieCreerClasseAcademique>
{
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly depotSectionScolaire: DepotSectionScolaire;
  private readonly depotOptionEtude: DepotOptionEtude;
  private readonly policyAudit: PolicyAudit;
  private readonly moteurStructureScolaire: MoteurStructureScolaire;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une classe academique.
  constructor(
    depotClasseAcademique: DepotClasseAcademique,
    depotSectionScolaire: DepotSectionScolaire,
    depotOptionEtude: DepotOptionEtude,
    policyAudit: PolicyAudit = new PolicyAudit(),
    moteurStructureScolaire: MoteurStructureScolaire = new MoteurStructureScolaire(),
  ) {
    this.depotClasseAcademique = depotClasseAcademique;
    this.depotSectionScolaire = depotSectionScolaire;
    this.depotOptionEtude = depotOptionEtude;
    this.policyAudit = policyAudit;
    this.moteurStructureScolaire = moteurStructureScolaire;
  }

  // Cette methode cree une classe academique rattachee a une section scolaire valide.
  public async executer(
    entree: CreerClasseAcademiqueEntree,
  ): Promise<SortieCreerClasseAcademique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_CLASSE_ACADEMIQUE',
      entreeValidee.creePar,
      horodatageCreation,
    );

    const sectionScolaire = await this.depotSectionScolaire.trouverParId(
      new SectionScolaireId(entreeValidee.idSectionScolaire),
    );

    if (sectionScolaire === null) {
      throw new ErreurSectionScolaireInvalide(
        "La section scolaire de rattachement est introuvable.",
      );
    }

    const classeAcademiqueExistante = await this.depotClasseAcademique.trouverParCode(
      entreeValidee.code,
    );

    if (classeAcademiqueExistante !== null) {
      throw new ErreurClasseAcademiqueDupliquee(
        'Une classe academique avec ce code existe deja.',
      );
    }

    const optionEtude = entreeValidee.idOptionEtude === undefined
      ? undefined
      : await this.depotOptionEtude.trouverParId(new OptionEtudeId(entreeValidee.idOptionEtude));

    if (entreeValidee.idOptionEtude !== undefined && optionEtude === null) {
      throw new ErreurOptionEtudeInvalide(
        "L'option d'etude referencee est introuvable.",
      );
    }

    const classeAcademique = new ClasseAcademique(
      new ClasseAcademiqueId(),
      sectionScolaire.obtenirId(),
      entreeValidee.code,
      entreeValidee.libelle,
      new OrdreClasse(entreeValidee.ordrePedagogique),
      entreeValidee.cycle,
      entreeValidee.accepteOptions,
      entreeValidee.optionObligatoire,
      entreeValidee.typeStructureEvaluation,
      optionEtude?.obtenirId(),
      true,
      horodatageCreation,
      undefined,
      1,
      entreeValidee.estClasseTENASOSP ?? false,
      entreeValidee.estClasseEXETAT ?? false,
      entreeValidee.estClasseFinaliste ?? false,
    );

    this.moteurStructureScolaire.validerStructurePedagogique(
      sectionScolaire,
      classeAcademique,
      optionEtude ?? undefined,
    );

    await this.depotClasseAcademique.sauvegarder(classeAcademique);

    return {
      classeAcademique: ClasseAcademiqueApplicationMapper.versSortie(classeAcademique),
    };
  }

  private validerEntree(
    entree: CreerClasseAcademiqueEntree,
  ): CreerClasseAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'entree du cas d'usage CreerClasseAcademique est obligatoire.",
      );
    }

    const classeEXETAT = this.validerBooleenOptionnel(entree.estClasseEXETAT, 'estClasseEXETAT') ?? false;
    const classeFinaliste = this.validerBooleenOptionnel(
      entree.estClasseFinaliste,
      'estClasseFinaliste',
    ) ?? classeEXETAT;

    return {
      idSectionScolaire: this.validerTexteObligatoire(entree.idSectionScolaire, 'idSectionScolaire'),
      code: this.validerTexteObligatoire(entree.code, 'code'),
      libelle: this.validerTexteObligatoire(entree.libelle, 'libelle'),
      ordrePedagogique: this.validerEntierPositif(entree.ordrePedagogique, 'ordrePedagogique'),
      cycle: this.validerTexteObligatoire(entree.cycle, 'cycle'),
      accepteOptions: this.validerBooleen(entree.accepteOptions, 'accepteOptions'),
      optionObligatoire: this.validerBooleen(entree.optionObligatoire, 'optionObligatoire'),
      typeStructureEvaluation: this.validerTypeStructureEvaluation(entree.typeStructureEvaluation),
      idOptionEtude: this.validerTexteOptionnel(entree.idOptionEtude),
      estClasseTENASOSP: this.validerBooleenOptionnel(entree.estClasseTENASOSP, 'estClasseTENASOSP') ?? false,
      estClasseEXETAT: classeEXETAT,
      estClasseFinaliste: classeFinaliste,
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
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

  private validerBooleenOptionnel(valeur: boolean | undefined, nomChamp: string): boolean | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    return this.validerBooleen(valeur, nomChamp);
  }
}
