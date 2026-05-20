import { UseCase } from '../../../application/UseCase';
import { RefreshTokenInput } from '../dto/input';
import { RefreshTokenOutput } from '../dto/output';
import { AuthApplicationService } from '../services/AuthApplicationService';

// Ce cas d'usage renouvelle le JWT et le refresh token.
export class RefreshTokenUseCase implements UseCase<RefreshTokenInput, RefreshTokenOutput> {
  constructor(private readonly authApplicationService: AuthApplicationService) {}

  public async executer(entree: RefreshTokenInput): Promise<RefreshTokenOutput> {
    return this.authApplicationService.refresh(entree);
  }
}
