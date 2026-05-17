import type { EncoderCoteInput } from '../../dto/input/EncoderCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';

// Ce contrat expose l'encodage applicatif d'une cote.
export interface EncodageCotesUseCase {
  executer(input: EncoderCoteInput): Promise<FicheCotationOutput>;
}
