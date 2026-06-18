import type { CodeColonneBulletin } from '../../domain/value-objects/CodeColonneBulletin';
import type { DossierSecondeSessionReadModel } from '../read-models/DossierSecondeSessionReadModel';

// Ce contrat lit les dossiers de seconde session d'une classe pour une colonne.
export interface DossierSecondeSessionQuery {
  executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
  ): Promise<DossierSecondeSessionReadModel[]>;
}
