declare const BRAND: unique symbol;

export interface Branded<K extends string> {
  readonly [BRAND]: K;
}

export type Brand<T, K extends string> = T & Branded<K>;
