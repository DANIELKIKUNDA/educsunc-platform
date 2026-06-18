import {
  CreerGrilleTarificationUseCase,
  DesactiverGrilleTarificationUseCase,
  ListerGrillesTarificationUseCase,
  ModifierGrilleTarificationUseCase,
} from '../../../application/use-cases/tarification';
import { TarificationValidator } from '../validators/TarificationValidator';

export class TarificationController {
  constructor(
    private readonly creerGrilleTarificationUseCase: CreerGrilleTarificationUseCase,
    private readonly listerGrillesTarificationUseCase: ListerGrillesTarificationUseCase,
    private readonly modifierGrilleTarificationUseCase: ModifierGrilleTarificationUseCase,
    private readonly desactiverGrilleTarificationUseCase: DesactiverGrilleTarificationUseCase,
  ) {}

  public async creer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = TarificationValidator.validerCreation(corps, headers);
    const sortie = await this.creerGrilleTarificationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async lister(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = TarificationValidator.validerListe(query, headers);
    const sortie = await this.listerGrillesTarificationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async modifier(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    const entree = TarificationValidator.validerModification(parametres, corps, headers);
    const sortie = await this.modifierGrilleTarificationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async desactiver(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    const entree = TarificationValidator.validerDesactivation(parametres, corps, headers);
    const sortie = await this.desactiverGrilleTarificationUseCase.executer(entree);
    return { donnee: sortie };
  }
}
