import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

// Ce fichier declare l erreur de fuite cross-tenant.

/** Cette erreur est levee lorsqu une operation tente de franchir illegitimement une frontiere tenant. */
export class ExceptionCrossTenantConfiguration extends ExceptionConfigurationDomain {
  constructor(message = 'L operation de configuration viole l isolation tenant.') {
    super(message);
    this.name = 'ExceptionCrossTenantConfiguration';
  }
}
