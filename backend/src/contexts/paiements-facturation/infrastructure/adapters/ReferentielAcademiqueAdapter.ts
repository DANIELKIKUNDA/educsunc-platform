import type {
  ClasseReglesFraisDTO as ClasseReglesFraisPaiementDTO,
  ReferentielAcademiquePort,
} from '../../application/ports/ReferentielAcademiquePort';

// Ce contrat local de lecture evite de coupler le BC Paiements a un use case interne du referentiel.
interface ReglesFraisClasseLecture {
  section: string | null;
  option?: {
    estTechnique: boolean;
    categorieTechnique?: string;
  } | null;
  estClasseTENASOSP: boolean;
  estClasseEXETAT: boolean;
  estClasseFinaliste: boolean;
  categorieFraisEtat?: string;
}

// Ce contrat represente le minimum attendu d'un repository de lecture du referentiel.
export interface ReglesFraisClasseRepository {
  consulterParClassePedagogique(
    idClassePedagogique: string,
  ): Promise<ReglesFraisClasseLecture | null>;
}

// Ce fichier adapte les faits du referentiel academique au contrat applicatif du BC Paiements.
export class ReferentielAcademiqueAdapter implements ReferentielAcademiquePort {
  // Ce constructeur recoit un repository de lecture deja specialise dans le referentiel academique.
  constructor(
    private readonly repository: ReglesFraisClasseRepository,
  ) {}

  // Cette methode lit les regles de frais d'une classe sans recalculer les montants financiers.
  public async consulterReglesFraisClasse(
    idClassePedagogique: string,
  ): Promise<ClasseReglesFraisPaiementDTO> {
    const regles = await this.repository.consulterParClassePedagogique(
      idClassePedagogique,
    );

    if (regles === null) {
      throw new Error(
        'Les regles de frais de la classe pedagogique sont introuvables.',
      );
    }

    return {
      idClassePedagogique,
      section: regles.section ?? undefined,
      optionEstTechnique: regles.option?.estTechnique ?? false,
      optionCategorieTechnique: regles.option?.categorieTechnique ?? undefined,
      estClasseTENASOSP: regles.estClasseTENASOSP,
      estClasseEXETAT: regles.estClasseEXETAT,
      estClasseFinaliste: regles.estClasseFinaliste,
      categorieFraisEtat: regles.categorieFraisEtat ?? undefined,
    };
  }
}
