import { IdentifiantUnique } from './IdentifiantUnique';

// Cet identifiant represente une responsabilite pedagogique de classe.
export class ResponsabiliteClassePedagogiqueId extends IdentifiantUnique {
  constructor(valeur?: string) {
    super(valeur);
  }
}
