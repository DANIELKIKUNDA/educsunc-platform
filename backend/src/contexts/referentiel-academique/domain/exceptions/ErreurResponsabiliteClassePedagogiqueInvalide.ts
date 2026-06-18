// Cette exception de domaine signale une responsabilite de classe pedagogique invalide.
export class ErreurResponsabiliteClassePedagogiqueInvalide extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurResponsabiliteClassePedagogiqueInvalide';
  }
}
