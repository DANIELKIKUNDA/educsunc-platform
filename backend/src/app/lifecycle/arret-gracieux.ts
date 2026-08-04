type SignalArret = 'SIGINT' | 'SIGTERM';

interface ProcessusSignaux {
  exitCode?: string | number | null;
  off(signal: SignalArret, listener: () => void): unknown;
  once(signal: SignalArret, listener: () => void): unknown;
}

interface ServeurFermable {
  close(): Promise<void>;
  log: {
    error(contexte: unknown, message: string): void;
    info(contexte: unknown, message: string): void;
  };
}

interface ControleArretGracieux {
  arreter(signal: SignalArret): Promise<void>;
  desinstaller(): void;
}

export function installerArretGracieux(
  serveur: ServeurFermable,
  processus: ProcessusSignaux = process,
): ControleArretGracieux {
  let arretEnCours: Promise<void> | undefined;

  const desinstaller = (): void => {
    processus.off('SIGINT', surSigint);
    processus.off('SIGTERM', surSigterm);
  };

  const arreter = (signal: SignalArret): Promise<void> => {
    if (arretEnCours) {
      return arretEnCours;
    }

    desinstaller();
    serveur.log.info({ signal }, 'Arret gracieux du serveur demande.');
    arretEnCours = serveur.close()
      .then(() => {
        serveur.log.info({ signal }, 'Serveur et ressources fermes proprement.');
      })
      .catch((erreur: unknown) => {
        processus.exitCode = 1;
        serveur.log.error({ erreur, signal }, "L'arret gracieux du serveur a echoue.");
      });

    return arretEnCours;
  };

  const surSigint = (): void => {
    void arreter('SIGINT');
  };
  const surSigterm = (): void => {
    void arreter('SIGTERM');
  };

  processus.once('SIGINT', surSigint);
  processus.once('SIGTERM', surSigterm);

  return { arreter, desinstaller };
}
