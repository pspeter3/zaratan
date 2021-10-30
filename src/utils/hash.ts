import { rotateBits, uint32 } from "./uint32";

const c1 = 0xcc9e2d51;
const c2 = 0x1b873593;
const r1 = 15;
const r2 = 12;
const m = 5;
const n = 0xe6546b64;

const mash = (hash: number, value: number): number => {
    value = Math.imul(value, c1);
    value = rotateBits(value, r1);
    value = Math.imul(value, c2);
    hash ^= value;
    hash = rotateBits(hash, r2);
    hash = uint32(Math.imul(hash, m) + n);
    return hash;
};

const finalize = (hash: number, bytes: number): number => {
    hash ^= bytes;
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return uint32(hash);
};

export interface List<T> extends Iterable<T>, ArrayLike<T> {}

/**
 * Hash a list of numbers.
 * @param list The list of numbers
 * @param seed An optional seed value
 * @returns The hash value
 */
export const hashList = (list: List<number>, seed = 0): number => {
    let hash = seed;
    for (const value of list) {
        hash = mash(hash, value);
    }
    return finalize(hash, list.length * 4);
};

/**
 * Hash a string.
 * @param text The text to hash
 * @param seed An optional seed value
 * @returns The hash value
 */
export const hashText = (text: string, seed = 0): number => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const step = 4;
    const max = Math.floor(bytes.length / step);
    let hash = seed;
    for (let i = 0; i < max; i++) {
        const offset = i * step;
        const value = uint32(
            (bytes[offset + 3] << 24) |
                (bytes[offset + 2] << 16) |
                (bytes[offset + 1] << 8) |
                bytes[offset],
        );
        hash = mash(hash, value);
    }
    let k = 0;
    const i = step * max;
    /* eslint-disable no-fallthrough */
    switch (bytes.length % step) {
        case 3: {
            k ^= bytes[i + 2] << 16;
        }
        case 2: {
            k ^= bytes[i + 1] << 8;
        }
        case 1: {
            k ^= bytes[i];
            k = Math.imul(k, c1);
            rotateBits(k, r1);
            hash ^= Math.imul(k, c2);
        }
    }
    /* eslint-enable no-fallthrough */
    return finalize(hash, bytes.length);
};
