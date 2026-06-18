import { PolitiqueOverrideConfiguration } from '../policies';
import { ConfigurationScope } from '../value-objects';

// Ce fichier declare la specification d override autorise.

/** Cette classe expose la decision de surcharge sous forme de specification. */
export class SpecificationOverrideAutorise {
  constructor(private readonly politique = new PolitiqueOverrideConfiguration()) {}

  /** Cette methode indique si la surcharge reste autorisee. */
  public estSatisfaitePar(
    source: ConfigurationScope,
    cible: ConfigurationScope,
    verrouille: boolean,
  ): boolean {
    return this.politique.autoriser(source, cible, verrouille);
  }
}
