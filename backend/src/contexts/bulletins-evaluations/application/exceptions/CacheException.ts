import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident de mise en cache applicative.
export class CacheException extends ApplicationException {
  constructor(message = 'Le cache du bulletin n a pas pu etre mis a jour.') {
    super(message, 'BULLETINS_CACHE_EXCEPTION');
    this.name = 'CacheException';
  }
}
