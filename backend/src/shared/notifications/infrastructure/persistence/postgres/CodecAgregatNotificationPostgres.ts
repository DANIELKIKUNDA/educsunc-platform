import * as DomaineNotification from '../../../domain';
import type { Notification } from '../../../domain';
type Encoded = null | string | number | boolean | Encoded[] | { [key:string]: Encoded };
export class CodecAgregatNotificationPostgres {
  public encoder(notification: Notification): Encoded { return this.encoderValeur(notification, new WeakSet()); }
  public decoder(valeur: unknown): Notification {
    const decoded = this.decoderValeur(valeur) as Notification;
    if (!decoded || typeof decoded.obtenirIdentifiant !== 'function') throw new Error('Snapshot PostgreSQL Notifications invalide.');
    return decoded;
  }
  private encoderValeur(valeur: unknown, vus: WeakSet<object>): Encoded {
    if (valeur === null || typeof valeur === 'string' || typeof valeur === 'number' || typeof valeur === 'boolean') return valeur;
    if (valeur instanceof Date) return { __type: 'Date', value: valeur.toISOString() };
    if (Array.isArray(valeur)) return valeur.map((v)=>this.encoderValeur(v, vus));
    if (typeof valeur !== 'object') return String(valeur);
    if (vus.has(valeur)) throw new Error('Cycle interdit dans le snapshot Notifications.');
    vus.add(valeur);
    const source = valeur as Record<string, unknown>;
    const encoded: Record<string, Encoded> = { __type: (valeur as {constructor?:{name?:string}}).constructor?.name ?? 'Object' };
    for (const [cle, item] of Object.entries(source)) encoded[cle] = this.encoderValeur(item, vus);
    vus.delete(valeur);
    return encoded;
  }
  private decoderValeur(valeur: unknown): unknown {
    if (valeur === null || typeof valeur !== 'object') return valeur;
    if (Array.isArray(valeur)) return valeur.map((v)=>this.decoderValeur(v));
    const source = valeur as Record<string, unknown>;
    if (source.__type === 'Date') return new Date(String(source.value));
    const type = typeof source.__type === 'string' ? source.__type : 'Object';
    const candidate = (DomaineNotification as unknown as Record<string, {prototype?: object}>)[type];
    const cible: Record<string, unknown> = candidate?.prototype ? Object.create(candidate.prototype) : {};
    for (const [cle, item] of Object.entries(source)) if (cle !== '__type') cible[cle] = this.decoderValeur(item);
    return cible;
  }
}
