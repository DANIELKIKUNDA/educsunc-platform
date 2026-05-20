import { PasswordHashAdapter } from '../adapters/crypto/PasswordHashAdapter';

// Ce service expose la facade technique de hash des mots de passe pour AUTH.
export class PasswordInfrastructureService extends PasswordHashAdapter {}
