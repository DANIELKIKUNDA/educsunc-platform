import {
  ActiverQualificationFinanciereEleveUseCase,
  DesactiverQualificationFinanciereEleveUseCase,
  ListerQualificationsFinancieresEleveUseCase,
} from '../../../application/use-cases/qualifications-financieres';
import { QualificationFinanciereEleveValidator } from '../validators/QualificationFinanciereEleveValidator';

export class QualificationFinanciereEleveController {
  constructor(
    private readonly activerQualificationUseCase: ActiverQualificationFinanciereEleveUseCase,
    private readonly desactiverQualificationUseCase: DesactiverQualificationFinanciereEleveUseCase,
    private readonly listerQualificationsUseCase: ListerQualificationsFinancieresEleveUseCase,
  ) {}

  public async activer(corps: unknown, headers: unknown) {
    const entree = QualificationFinanciereEleveValidator.validerActivation(corps, headers);
    const sortie = await this.activerQualificationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async desactiver(parametres: unknown, corps: unknown, headers: unknown) {
    const entree = QualificationFinanciereEleveValidator.validerDesactivation(parametres, corps, headers);
    const sortie = await this.desactiverQualificationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async lister(parametres: unknown, headers: unknown) {
    const entree = QualificationFinanciereEleveValidator.validerListe(parametres, headers);
    const sortie = await this.listerQualificationsUseCase.executer(entree);
    return { donnee: sortie };
  }
}
