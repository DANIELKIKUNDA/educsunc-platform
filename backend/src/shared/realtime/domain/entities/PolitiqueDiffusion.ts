import type { PrioriteRealtime, TypeDiffusionRealtime } from '../enums';

export interface PolitiqueDiffusionProps {
  readonly prioriteParDefaut: PrioriteRealtime;
  readonly typeDiffusionParDefaut: TypeDiffusionRealtime;
  readonly offlineFirst: boolean;
  readonly canauxAutorises: readonly string[];
}

export class PolitiqueDiffusion {
  public readonly prioriteParDefaut: PrioriteRealtime;
  public readonly typeDiffusionParDefaut: TypeDiffusionRealtime;
  public readonly offlineFirst: boolean;
  public readonly canauxAutorises: readonly string[];

  public constructor(props: PolitiqueDiffusionProps) {
    this.prioriteParDefaut = props.prioriteParDefaut;
    this.typeDiffusionParDefaut = props.typeDiffusionParDefaut;
    this.offlineFirst = props.offlineFirst;
    this.canauxAutorises = [...props.canauxAutorises];
  }

  public canalAutorise(canal: string): boolean {
    return this.canauxAutorises.includes(canal);
  }
}
