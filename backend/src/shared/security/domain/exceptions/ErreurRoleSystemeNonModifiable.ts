import { ErreurSecurite } from './ErreurSecurite';

export class ErreurRoleSystemeNonModifiable extends ErreurSecurite {
  constructor(message = 'Le role systeme ne peut pas etre modifie') {
    super(message);
    this.name = 'ErreurRoleSystemeNonModifiable';
  }
}
