import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { DossierDeliberationReadModel } from '../read-models/DossierDeliberationReadModel';

// Ce contrat lit les dossiers de deliberation d'une classe pour une colonne.
export interface DossierDeliberationQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<DossierDeliberationReadModel[]>;
}
