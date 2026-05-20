import type { LoginUseCase } from 'shared/auth/application/use-cases/LoginUseCase';
import { LoginPresenter } from '../presenters/LoginPresenter';
import { LoginValidator } from '../validators/LoginValidator';

// Ce controleur expose le login AUTH au monde HTTP.
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  // Cette methode valide la requete et appelle le cas d'usage de login.
  public async login(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = LoginValidator.valider(corps, headers);
    const sortie = await this.loginUseCase.executer(entree);
    return LoginPresenter.presenter(sortie);
  }
}
