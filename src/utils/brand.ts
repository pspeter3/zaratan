/**
 * Phantom symbol used to attach nominal brand information at the type level.
 */
declare const BRAND: unique symbol;

/**
 * Marker interface used to make structurally identical values distinct.
 *
 * @typeParam K - Compile-time label describing the brand.
 */
export interface Branded<K extends string> {
  /** Phantom property carrying the brand label. */
  readonly [BRAND]: K;
}

/**
 * Produces a nominally branded variant of an otherwise structural type.
 *
 * @typeParam T - The runtime representation being branded.
 * @typeParam K - Compile-time label used to distinguish the branded value.
 */
export type Brand<T, K extends string> = T & Branded<K>;
