/**
 * Generates a simple unique ID string.
 * @returns
 */
export const generateId = (): string => `tour_step_${Math.random().toString(36).substring(2, 9)}`;
