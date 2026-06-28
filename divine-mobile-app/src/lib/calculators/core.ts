export const MASTER_NUMBERS = [11, 22, 33];

/**
 * Reduces a number to a single digit, unless it's a Master Number (11, 22, 33).
 * @param num The number to reduce.
 * @param preserveMasterNumbers If true, returns 11, 22, 33 as is.
 */
export const reduceToSingleDigit = (num: number, preserveMasterNumbers: boolean = true): number => {
    if (num === 0) return 0;

    // Recursively reduce until single digit or master number
    if (preserveMasterNumbers && MASTER_NUMBERS.includes(num)) {
        return num;
    }

    if (num <= 9) {
        return num;
    }

    const sum = String(num)
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    return reduceToSingleDigit(sum, preserveMasterNumbers);
};

/**
 * Pythagorean Letter Mapping
 * 1: A, J, S
 * 2: B, K, T
 * 3: C, L, U
 * 4: D, M, V
 * 5: E, N, W
 * 6: F, O, X
 * 7: G, P, Y
 * 8: H, Q, Z
 * 9: I, R
 */
export const PYTHAGOREAN_MAPPING: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

/**
 * Helper to check if a character is a vowel.
 * Note: 'y' handling is context dependent in advanced systems, 
 * but for basic Pythagorean it acts as a vowel if there are no other vowels in the syllable
 * or sometimes simply treated as a vowel or consonant depending on strict schools.
 * 
 * STANDARD IMPLEMENTATION FOR THIS APP:
 * - A, E, I, O, U are always vowels.
 * - Y is a vowel if it is NOT at the start of a word/syllable and has no other vowel adjacent?
 * 
 * TO KEEP IT DETERMINISTIC AND SIMPLE AS REQUESTED:
 * We will follow the provided rule "A=1...I=9" and standard Vowel/Consonant logic.
 * Defaulting Y to Consonant for simple Pythagorean unless it serves as the ONLY vowel sound.
 * However, many online calculators treat Y as a vowel if it makes a vowel sound.
 * 
 * We will use a flag or simple rule: 'y' is a vowel if it's not the first letter?
 * Or safer: strict A, E, I, O, U are vowels.
 * 
 * Let's stick to standard strict Vowels = A, E, I, O, U for 1.0 to ensure deterministic behavior matches common charts.
 */
export const VOWELS = ['a', 'e', 'i', 'o', 'u'];

export const isVowel = (char: string): boolean => {
    return VOWELS.includes(char.toLowerCase());
};
