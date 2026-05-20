import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ClasseReglesFraisDTO } from '../../dto/output/ClasseReglesFraisDTO';

// Ce DTO represente la demande de consultation des faits de frais d'une classe pedagogique.
export interface ConsulterReglesFraisClasseEntree {
  idClassePedagogique: string;
}

// Ce port de lecture fournit les faits academiques necessaires au BC Paiements.
export interface ReglesFraisClasseRepository {
  consulterParClassePedagogique(
    idClassePedagogique: string,
  ): Promise<ClasseReglesFraisDTO | null>;
}

// Ce cas d'usage orchestre la consultation des faits de frais sans porter de decision de paiement.
export class ConsulterReglesFraisClasse
  implements UseCase<ConsulterReglesFraisClasseEntree, ClasseReglesFraisDTO>
{
  // Ce constructeur injecte le repository de lecture specialise.
  constructor(private readonly repository: ReglesFraisClasseRepository) {}

  // Cette methode retourne les faits academiques d'une classe pedagogique.
  public async executer(
    entree: ConsulterReglesFraisClasseEntree,
  ): Promise<ClasseReglesFraisDTO> {
    const idClassePedagogique = this.validerIdentifiant(entree?.idClassePedagogique);
    const regles = await this.repository.consulterParClassePedagogique(idClassePedagogique);

    if (regles === null) {
      throw new ErreurClassePedagogiqueInvalide(
        'La classe pedagogique demandee est introuvable.',
      );
    }

    return regles;
  }

  private validerIdentifiant(valeur: string | undefined): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'identifiant de classe pedagogique est obligatoire.",
      );
    }

    return valeur.trim();
  }
}
