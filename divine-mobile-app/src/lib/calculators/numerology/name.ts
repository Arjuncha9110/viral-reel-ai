// Letter Mapping Objects
export const PYTHAGOREAN_MAP: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

export const CHALDEAN_MAP: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

/**
 * Gets the numeric value of a letter based on the selected system.
 */
export function getLetterValue(letter: string, useChaldean: boolean): number {
    const L = letter.toUpperCase();
    if (useChaldean) {
        return CHALDEAN_MAP[L] ?? 0;
    }
    return PYTHAGOREAN_MAP[L] ?? 0;
}

const isVowel = (char: string): boolean => VOWELS.includes(char.toUpperCase());

export interface NumberBreakdown {
    label: string;
    sum: number;
    breakdown: string;
    reduced: number;
    isMaster: boolean;
}

/**
 * Standard Reduction Logic
 */
export const reduceNumber = (value: number, mode: 'pythagorean' | 'chaldean'): { reduced: number; isMaster: boolean } => {
    if (value === 0) return { reduced: 0, isMaster: false };

    // Pythagorean preserves 11, 22, 33
    // Chaldean: "Preserve 11 and 22. Only reduce 33+"
    const masters = mode === 'pythagorean' ? [11, 22, 33] : [11, 22];

    const reduceRecursive = (n: number): number => {
        if (masters.includes(n)) return n;
        if (n <= 9) return n;

        const next = String(n).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        return reduceRecursive(next);
    };

    const final = reduceRecursive(value);
    return { reduced: final, isMaster: masters.includes(final) };
};

/**
 * Main Calculator Function
 */
export const calculateNameNumberDetails = (
    fullName: string,
    type: 'expression' | 'soul' | 'personality',
    useChaldean: boolean
): NumberBreakdown => {
    let totalSum = 0;
    const letterDetails: string[] = [];

    // Process characters
    for (const char of fullName) {
        if (/[a-zA-Z]/.test(char)) {
            const val = getLetterValue(char, useChaldean);
            const isV = isVowel(char);

            const shouldInclude =
                type === 'expression' ||
                (type === 'soul' && isV) ||
                (type === 'personality' && !isV);

            if (shouldInclude && val > 0) {
                totalSum += val;
                letterDetails.push(`${char.toUpperCase()}(${val})`);
            }
        }
    }

    const { reduced, isMaster } = reduceNumber(totalSum, useChaldean ? 'chaldean' : 'pythagorean');

    return {
        label: type.charAt(0).toUpperCase() + type.slice(1) + ' Number',
        sum: totalSum,
        breakdown: letterDetails.join(' + '),
        reduced,
        isMaster
    };
};

export const getCompoundMeaning = (n: number): string => {
    const meanings: Record<number, string> = {
        10: "The Wheel of Fortune. Honor, faith, and self-confidence. Plans likely to succeed.",
        11: "A Lion Muzzled. Hidden dangers, trials, and difficulties from others.",
        12: "The Sacrifice. Mental anxiety and suffering for others. Sacrifice for a cause.",
        13: "Change and Transformation. Not unlucky but signifies a change in plans, place, or situation.",
        14: "Movement and Challenge. Success through communication and public relations, but needs caution.",
        15: "Magnetism and Magic. Eloquence, music, and art. Strongly attracts others.",
        16: "The Shattered Citadel. Warning of accidents or defeat from sudden events.",
        17: "The Star of the Magi. Spiritual number. Peace and love. Rising above trials.",
        18: "Material vs Spiritual Conflict. Danger from the elements or storms. Deceptive enemies.",
        19: "The Prince of Heaven. Success, happiness, and esteem. Winning over obstacles.",
        20: "The Awakening. New plans, new ambitions. Success after long delays.",
        21: "The Crown of the Magi. Victory and success after along struggle. Advancement.",
        22: "Blind Trust. Warning against illusions and deception. Goodness that needs wisdom.",
        23: "The Royal Star of the Lion. Success in business and high positions. Protection by superiors.",
        24: "Love and Prosperity. Success through the opposite sex. Helpful influential friends.",
        25: "Experience and Wisdom. Success through hard work and past mistakes. Spiritual growth.",
        26: "The Partnership. Artistic talent and success through partnerships. Caution in material matters.",
        27: "The Scepter. Authority, power, and command. Rewards from intelligence and imagination.",
        28: "The Trusting Friend. Great potential, but warning against loss through others.",
        29: "The Test of Faith. Uncertainties, betrayals, and deceptions in relationships.",
        30: "The Loner. Introspection, thoughtfulness, and mental superiority over material.",
        31: "The Solitary. Similar to 30 but more focused on self-containment and isolation.",
        32: "The Messenger. Communication and public speaking. Good luck if the person stays true.",
    };
    return meanings[n] || "A significant compound vibration that emphasizes personal growth and destiny.";
};

export const getLoShuGrid = (dob: string): (number | null)[][] => {
    const digits = dob.replace(/[^0-9]/g, '').split('').map(Number);
    const grid: (number | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    const pos: Record<number, { r: number; c: number }> = {
        4: { r: 0, c: 0 }, 9: { r: 0, c: 1 }, 2: { r: 0, c: 2 },
        3: { r: 1, c: 0 }, 5: { r: 1, c: 1 }, 7: { r: 1, c: 2 },
        8: { r: 2, c: 0 }, 1: { r: 2, c: 1 }, 6: { r: 2, c: 2 }
    };

    digits.forEach(d => {
        if (d > 0 && pos[d]) {
            const { r, c } = pos[d];
            grid[r][c] = d;
        }
    });

    return grid;
};
