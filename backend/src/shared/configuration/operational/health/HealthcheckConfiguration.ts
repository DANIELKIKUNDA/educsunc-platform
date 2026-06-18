import { FacadeInfrastructureConfiguration } from '../../infrastructure';
import type { EtatSanteConfigurationOperational } from './EtatSanteConfigurationOperational';

// Ce fichier declare le healthcheck operational du module Configuration.

export class HealthcheckConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public executer(): readonly EtatSanteConfigurationOperational[] {
    const diagnostic = this.facade.diagnostiquer();
    return [
      {
        composant: 'CACHE',
        statut: diagnostic.cache.some((entree) => entree.statut === 'WARNING') ? 'DEGRADED' : 'HEALTHY',
        details: `${diagnostic.cache.length} diagnostics cache`,
      },
      {
        composant: 'PROPAGATION',
        statut: diagnostic.propagation.some((entree) => entree.statut === 'WARNING') ? 'DEGRADED' : 'HEALTHY',
        details: `${diagnostic.propagation.length} diagnostics propagation`,
      },
      {
        composant: 'RELOAD',
        statut: diagnostic.reload.some((entree) => entree.statut === 'WARNING') ? 'DEGRADED' : 'HEALTHY',
        details: `${diagnostic.reload.length} diagnostics reload`,
      },
      {
        composant: 'PERSISTENCE',
        statut: 'HEALTHY',
        details: 'Stockage memoire disponible',
      },
    ];
  }
}
