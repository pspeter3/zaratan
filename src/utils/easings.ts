/**
 * Linear easing.
 * @param t The value to ease
 * @returns The linear value
 */
export const linear = (t: number): number => t;

/**
 * Smoothstep easing.
 * @param t The value to ease
 * @returns The smoothstep value
 */
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/**
 * Smootherstep easing.
 * @param t The value to ease
 * @returns The smootherstep value
 */
export const smootherstep = (t: number): number =>
    t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Inverse Smoothstep easing.
 * @param t The value to ease
 * @returns The inverse smoothstep value
 */
export const inversestep = (t: number): number =>
    0.5 - Math.sin(Math.asin(1 - 2 * t) / 3);

export enum Easing {
    Linear,
    SmoothStep,
    SmootherStep,
    InverseStep,
}

/**
 * Ease value based on easing function.
 * @param easing The easing function
 * @param t The value to ease
 * @returns The eased value
 */
export const ease = (easing: Easing, t: number): number => {
    switch (easing) {
        case Easing.Linear: {
            return linear(t);
        }
        case Easing.SmoothStep: {
            return smoothstep(t);
        }
        case Easing.SmootherStep: {
            return smootherstep(t);
        }
        case Easing.InverseStep: {
            return inversestep(t);
        }
    }
};
