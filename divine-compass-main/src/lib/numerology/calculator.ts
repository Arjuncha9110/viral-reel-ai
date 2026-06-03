import { PYTHAGOREAN_MAPPING, isVowel, reduceToSingleDigit } from "../calculators/core";

/**
 * Numerology Calculator Module
 * Implements standard Pythagorean numerology calculations.
 */

// Re-export constants for ease of use if needed, but primarily used internally
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

/**
 * Calculates the Expression Number (Destiny Number).
 * Rules:
 * - Use ALL letters in the full name
 * - Convert letters using Pythagorean mapping
 * - Sum all values
 * - Preserve Master Numbers (11, 22, 33)
 * - Otherwise reduce to single digit
 * 
 * @param name The full name
 * @returns The calculated Expression Number
 */
export const calculateExpressionNumber = (name: string): number => {
    // 1. Clean the name: simple lowercase and remove non-alpha chars
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');

    // 2. Map characters to values
    const sum = cleanName.split('').reduce((acc, char) => {
        return acc + (PYTHAGOREAN_MAPPING[char] || 0);
    }, 0);

    // 3. Reduce
    return reduceToSingleDigit(sum, true);
};

/**
 * Calculates the Soul Urge Number (Heart's Desire).
 * Rules:
 * - Use VOWELS ONLY (A, E, I, O, U)
 * - Y is treated as Consonant per "Strict Pythagorean" request for now
 * - Sum vowel values
 * - Preserve Master Numbers
 * - Reduce to single digit
 * 
 * @param name The full name
 * @returns The calculated Soul Number
 */
export const calculateSoulNumber = (name: string): number => {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');

    const sum = cleanName.split('').reduce((acc, char) => {
        // Strict Vowel Check: A, E, I, O, U
        if (isVowel(char)) {
            return acc + (PYTHAGOREAN_MAPPING[char] || 0);
        }
        return acc;
    }, 0);

    return reduceToSingleDigit(sum, true);
};

/**
 * Calculates the Personality Number.
 * Rules:
 * - Use CONSONANTS ONLY
 * - Sum consonant values
 * - Preserve Master Numbers
 * - Reduce to single digit
 * 
 * @param name The full name
 * @returns The calculated Personality Number
 */
export const calculatePersonalityNumber = (name: string): number => {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');

    const sum = cleanName.split('').reduce((acc, char) => {
        // Consonant = Not Vowel
        if (!isVowel(char)) {
            return acc + (PYTHAGOREAN_MAPPING[char] || 0);
        }
        return acc;
    }, 0);

    return reduceToSingleDigit(sum, true);
};
