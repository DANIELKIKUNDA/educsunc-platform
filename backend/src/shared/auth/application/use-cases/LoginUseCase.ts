import { UseCase } from '../../../application/UseCase';
import { LoginInput } from '../dto/input';
import { LoginOutput } from '../dto/output';
import { AuthApplicationService } from '../services/AuthApplicationService';

// Ce cas d'usage ouvre une authentification complete.
export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  constructor(private readonly authApplicationService: AuthApplicationService) {}

  public async executer(entree: LoginInput): Promise<LoginOutput> {
    return this.authApplicationService.login(entree);
  }
}
