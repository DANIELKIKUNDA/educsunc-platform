import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PasswordHashPort } from '../../../application/ports/crypto/PasswordHashPort';

// Cet adaptateur implemente le hash et la verification des mots de passe.
export class PasswordHashAdapter implements PasswordHashPort {
  public async hacherMotDePasse(motDePasseClair: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(String(motDePasseClair || ''), salt, 32, { N: 16384 }).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  public async verifierMotDePasse(motDePasseClair: string, motDePasseHash: string): Promise<boolean> {
    const parties = String(motDePasseHash || '').trim().split(':');
    if (parties.length !== 3 || parties[0] !== 'scrypt') {
      return false;
    }

    const sel = parties[1];
    const attendu = Buffer.from(parties[2], 'hex');
    const calcule = scryptSync(String(motDePasseClair || ''), sel, attendu.length, { N: 16384 });
    return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
  }
}
