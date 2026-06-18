import type { MessageTempsReel } from '../../domain';

const fileAttente: MessageTempsReel[] = [];

export class FileAttenteRealtimeOffline {
  public ajouter(message: MessageTempsReel): void {
    fileAttente.push(message);
  }

  public drainer(): readonly MessageTempsReel[] {
    const copie = [...fileAttente];
    fileAttente.length = 0;
    return copie;
  }
}
