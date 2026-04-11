// Le logger centralise la journalisation technique pour tracer l'execution, diagnostiquer les incidents et standardiser les logs de l'application.
export interface Journaliseur {
  // Ecrit une information utile sur le fonctionnement normal.
  info(message: string, contexte?: any): void;

  // Ecrit un avertissement quand une situation merite une attention.
  avertir(message: string, contexte?: any): void;

  // Ecrit une erreur quand une operation echoue.
  erreur(message: string, contexte?: any): void;

  // Ecrit un message de debug pour faciliter l'analyse technique.
  debug(message: string, contexte?: any): void;

  // Ajoute un contexte global partage par tous les logs suivants.
  ajouterContexteGlobal(contexte: Record<string, any>): void;
}
