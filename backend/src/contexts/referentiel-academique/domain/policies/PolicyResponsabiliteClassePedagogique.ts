import { ErreurResponsabiliteClassePedagogiqueDupliquee } from '../exceptions/ErreurResponsabiliteClassePedagogiqueDupliquee';
import { ErreurResponsabiliteClassePedagogiqueInvalide } from '../exceptions/ErreurResponsabiliteClassePedagogiqueInvalide';

// Cette policy protege la coherence metier d'une responsabilite de classe pedagogique.
export class PolicyResponsabiliteClassePedagogique {
  public verifierAttribution(params: {
    classePedagogiqueExisteDejaAvecResponsableActif: boolean;
    memeEcole: boolean;
    memeAnneeScolaire: boolean;
    classeAcademiqueCoherente: boolean;
    sectionScolaireCoherente: boolean;
  }): void {
    if (params.classePedagogiqueExisteDejaAvecResponsableActif) {
      throw new ErreurResponsabiliteClassePedagogiqueDupliquee(
        'Une classe pedagogique ne peut pas avoir plus d un responsable actif pour la meme annee scolaire.',
      );
    }

    if (!params.memeEcole) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        'La responsabilite de classe doit rester dans la meme ecole que la classe pedagogique ciblee.',
      );
    }

    if (!params.memeAnneeScolaire) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        'La responsabilite de classe doit rester dans la meme annee scolaire que la classe pedagogique ciblee.',
      );
    }

    if (!params.classeAcademiqueCoherente) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        'La classe academique de la responsabilite doit correspondre a la classe academique de la classe pedagogique.',
      );
    }

    if (!params.sectionScolaireCoherente) {
      throw new ErreurResponsabiliteClassePedagogiqueInvalide(
        'La section scolaire de la responsabilite doit correspondre a la section scolaire de la classe academique ciblee.',
      );
    }
  }
}
