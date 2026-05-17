import type { EncoderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase';
import type { ModifierCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase';
import type { ViderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase';
import { EncoderCoteValidator } from '../validators/EncoderCoteValidator';
import { ModifierCoteValidator } from '../validators/ModifierCoteValidator';
import { ViderCoteValidator } from '../validators/ViderCoteValidator';

// Ce controleur porte uniquement les commandes HTTP d'encodage et de correction simple des cotes.
export class EncodageCotesController {
  // Ce constructeur injecte les cas d'usage strictement necessaires a cette famille d'endpoints.
  constructor(
    private readonly encoderCoteUseCase: EncoderCoteUseCase,
    private readonly modifierCoteUseCase: ModifierCoteUseCase,
    private readonly viderCoteUseCase: ViderCoteUseCase,
  ) {}

  // Cette methode enregistre une cote initiale apres validation HTTP.
  public async encoder(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = EncoderCoteValidator.valider(corps, headers);
    const sortie = await this.encoderCoteUseCase.executer(entree);
    return { donnee: sortie };
  }

  // Cette methode met a jour une cote existante a partir des parametres de route et du corps HTTP.
  public async modifier(params: unknown, corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ModifierCoteValidator.valider(params, corps, headers);
    const sortie = await this.modifierCoteUseCase.executer(entree);
    return { donnee: sortie };
  }

  // Cette methode effectue le vidage logique d'une cote deja enregistree.
  public async supprimer(params: unknown, corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ViderCoteValidator.valider(params, corps, headers);
    const sortie = await this.viderCoteUseCase.executer(entree);
    return { donnee: sortie };
  }
}
