import { ErreurAuthentification } from './ErreurAuthentification';

// Cette erreur signale qu'un compte desactive ne peut pas se connecter.
export class ErreurCompteDesactive extends ErreurAuthentification {
  constructor(message = 'Compte desactive') {
    super(message);
    this.name = 'ErreurCompteDesactive';
  }
}
