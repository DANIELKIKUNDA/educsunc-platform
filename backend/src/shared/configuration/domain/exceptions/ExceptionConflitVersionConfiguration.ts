import { ExceptionConfigurationDomain } from './ExceptionConfigurationDomain';

/** Signale qu une autre ecriture a modifie la configuration depuis sa lecture. */
export class ExceptionConflitVersionConfiguration extends ExceptionConfigurationDomain {
  constructor(configurationId: string) {
    super(
      `La configuration ${configurationId} a ete modifiee par une autre operation. Relisez-la avant de recommencer.`,
    );
    this.name = 'ExceptionConflitVersionConfiguration';
  }
}
