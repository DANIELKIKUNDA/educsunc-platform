import { ClasseAcademique } from '../aggregates/ClasseAcademique';
import { OptionEtude } from '../aggregates/OptionEtude';
import { SectionScolaire } from '../aggregates/SectionScolaire';
import { ErreurClasseAcademiqueInvalide } from '../exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurCompatibiliteClasseOption } from '../exceptions/ErreurCompatibiliteClasseOption';

// Ce rapport decrit le resultat d'une verification structurelle complete.
export interface RapportStructureScolaire {
  sectionCompatible: boolean;
  optionCompatible: boolean;
}

// Ce moteur garantit la coherence structurelle entre sections, classes academiques et options.
export class MoteurStructureScolaire {
  // Cette methode valide l'ensemble de la structure pedagogique concernee.
  public validerStructurePedagogique(
    section: SectionScolaire,
    classe: ClasseAcademique,
    option?: OptionEtude,
  ): RapportStructureScolaire {
    this.verifierCompatibiliteSectionClasse(section, classe);
    this.verifierCompatibiliteClasseOption(section, classe, option);

    return {
      sectionCompatible: true,
      optionCompatible: true,
    };
  }

  // Cette methode verifie qu'une classe academique reste rattachee a la bonne section active.
  public verifierCompatibiliteSectionClasse(
    section: SectionScolaire,
    classe: ClasseAcademique,
  ): void {
    if (!section.estActive()) {
      throw new ErreurClasseAcademiqueInvalide(
        'Une section inactive ne peut pas porter de nouvelles classes academiques.',
      );
    }

    if (!classe.obtenirSectionScolaireId().estEgal(section.obtenirId())) {
      throw new ErreurClasseAcademiqueInvalide(
        'La classe academique doit etre rattachee a une seule section scolaire coherente.',
      );
    }
  }

  // Cette methode verifie qu'une option reste compatible avec la classe academique et sa section.
  public verifierCompatibiliteClasseOption(
    section: SectionScolaire,
    classe: ClasseAcademique,
    option?: OptionEtude,
  ): void {
    if (option === undefined) {
      if (classe.estOptionObligatoire() || this.estClasseHumanite(classe)) {
        throw new ErreurCompatibiliteClasseOption(
          'Une classe academique qui exige une option doit etre rattachee a une option valide.',
        );
      }

      if (classe.obtenirOptionEtudeId() !== undefined) {
        throw new ErreurCompatibiliteClasseOption(
          'Une option de classe academique declaree doit etre resolue explicitement.',
        );
      }

      return;
    }

    if (!option.estActive()) {
      throw new ErreurCompatibiliteClasseOption(
        "Une option inactive ne peut pas etre associee a une classe academique exploitable.",
      );
    }

    if (!classe.accepteOptionsEtude()) {
      throw new ErreurCompatibiliteClasseOption(
        "Cette classe academique n'accepte aucune option d'etude.",
      );
    }

    if (this.estSectionPrimaire(section)) {
      throw new ErreurCompatibiliteClasseOption(
        'Une classe primaire ne peut pas recevoir une option d etude.',
      );
    }

    if (this.estClasseEnseignementBase(classe)) {
      throw new ErreurCompatibiliteClasseOption(
        'Une classe de type EB ne peut pas recevoir une option de type humanite.',
      );
    }

    if (classe.obtenirOptionEtudeId() !== undefined && !classe.obtenirOptionEtudeId()?.estEgal(option.obtenirId())) {
      throw new ErreurCompatibiliteClasseOption(
        "L'option fournie ne correspond pas a l'option deja referencee par la classe academique.",
      );
    }
  }

  // Cette methode indique si une classe peut recevoir une option sans lever d'erreur.
  public peutRecevoirOption(
    section: SectionScolaire,
    classe: ClasseAcademique,
    option?: OptionEtude,
  ): boolean {
    try {
      this.verifierCompatibiliteClasseOption(section, classe, option);
      return true;
    } catch {
      return false;
    }
  }

  private normaliserTexte(valeur: string): string {
    return valeur.trim().toUpperCase();
  }

  private estSectionPrimaire(section: SectionScolaire): boolean {
    const code = this.normaliserTexte(section.obtenirCode());
    const libelle = this.normaliserTexte(section.obtenirLibelle());

    return code.includes('PRI') || libelle.includes('PRIMAIRE');
  }

  private estClasseEnseignementBase(classe: ClasseAcademique): boolean {
    const code = this.normaliserTexte(classe.obtenirCode());
    const libelle = this.normaliserTexte(classe.obtenirLibelle());
    const cycle = this.normaliserTexte(classe.obtenirCycle());

    return code.includes('EB') || libelle.includes(' EB') || cycle.includes('EB');
  }

  private estClasseHumanite(classe: ClasseAcademique): boolean {
    const code = this.normaliserTexte(classe.obtenirCode());
    const libelle = this.normaliserTexte(classe.obtenirLibelle());
    const cycle = this.normaliserTexte(classe.obtenirCycle());

    return code.includes('HUM') || libelle.includes('HUMANITE') || cycle.includes('HUMANITE');
  }
}
