import type {
  ClasseReglesFraisDTO as ClasseReglesFraisPaiementDTO,
  ReferentielAcademiquePort,
} from '../../application/ports/ReferentielAcademiquePort';
import type { ReglesFraisClasseRepository } from '../../../referentiel-academique/application/use-cases/structure/ConsulterReglesFraisClasse';

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
      section: regles.section,
      optionEstTechnique: regles.option?.estTechnique ?? false,
      optionCategorieTechnique: regles.option?.categorieTechnique ?? undefined,
      estClasseTENASOSP: regles.estClasseTENASOSP,
      estClasseEXETAT: regles.estClasseEXETAT,
      estClasseFinaliste: regles.estClasseFinaliste,
      categorieFraisEtat: regles.categorieFraisEtat,
    };
  }
}
