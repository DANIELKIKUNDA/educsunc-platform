// Cette exception de domaine signale un conflit de responsabilite active sur une classe.
export class ErreurResponsabiliteClassePedagogiqueDupliquee extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurResponsabiliteClassePedagogiqueDupliquee';
  }
}
