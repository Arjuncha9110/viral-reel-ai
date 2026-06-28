export interface LoShuCell {
    digit: number;
    count: number;
    position: { row: number; col: number };
}

export interface LoShuArrow {
    name: string;
    numbers: number[];
    type: 'strength' | 'weakness';
    meaning: string;
}

const ARROW_DEFINITIONS = [
    { name: "Practicality", numbers: [1, 4, 7], meaning: "Strong practical abilities, focus on physical reality and material success." },
    { name: "Emotional Balance", numbers: [2, 5, 8], meaning: "Deep emotional intelligence, stability, and understanding of human feelings." },
    { name: "Intellect", numbers: [3, 6, 9], meaning: "Sharp mental faculties, creative thinking, and intellectual prowess." },
    { name: "Creativity", numbers: [1, 2, 3], meaning: "Originality in thought and action, artistic talent, and innovative spirit." },
    { name: "Determination", numbers: [4, 5, 6], meaning: "Strong-willed nature, persistence, and the drive to overcome obstacles." },
    { name: "Will Power", numbers: [7, 8, 9], meaning: "Unyielding resolve, leadership qualities, and the power to influence others." }
];

const GRID_MAPPING: Record<number, { row: number; col: number }> = {
    1: { row: 2, col: 1 }, // Bottom Middle
    2: { row: 0, col: 2 }, // Top Right
    3: { row: 1, col: 0 }, // Middle Left
    4: { row: 0, col: 0 }, // Top Left
    5: { row: 1, col: 1 }, // Center
    6: { row: 2, col: 2 }, // Bottom Right
    7: { row: 1, col: 2 }, // Middle Right
    8: { row: 2, col: 0 }, // Bottom Left
    9: { row: 0, col: 1 }  // Top Middle
};

const MISSING_NUMBER_MEANINGS: Record<number, string> = {
    1: "Possible challenges in self-expression or starting new ventures.",
    2: "May need to develop more sensitivity or cooperation with others.",
    3: "Could struggle with concentration or imaginative pursuits.",
    4: "Discipline or organizational skills might require more conscious effort.",
    5: "Balance between stability and change might be harder to maintain.",
    6: "Responsibilities towards family or domestic life might feel overwhelming.",
    7: "Self-reflection or spiritual pursuits might not come naturally.",
    8: "Financial management or material stability might be a focus area.",
    9: "Ambition or long-term goals might need more clarity."
};

export const generateLoShuGrid = (dob: Date) => {
    const day = dob.getDate().toString().padStart(2, '0');
    const month = (dob.getMonth() + 1).toString().padStart(2, '0');
    const year = dob.getFullYear().toString();

    const allDigits = (day + month + year).split('').map(Number);
    const counts: Record<number, number> = {};

    allDigits.forEach(d => {
        if (d === 0) return;
        counts[d] = (counts[d] || 0) + 1;
    });

    const cells: LoShuCell[] = [];
    for (let digit = 1; digit <= 9; digit++) {
        cells.push({
            digit,
            count: counts[digit] || 0,
            position: GRID_MAPPING[digit]
        });
    }

    return { cells, counts };
};

export const detectMissingNumbers = (counts: Record<number, number>) => {
    const missing = [];
    for (let i = 1; i <= 9; i++) {
        if (!counts[i]) {
            missing.push({
                number: i,
                meaning: MISSING_NUMBER_MEANINGS[i] || "General missing number interpretation."
            });
        }
    }
    return missing;
};

export const detectRepeatingNumbers = (counts: Record<number, number>) => {
    const repeating = [];
    for (let i = 1; i <= 9; i++) {
        if (counts[i] > 1) {
            repeating.push({
                number: i,
                count: counts[i],
                intensity: counts[i] >= 3 ? 'Dominant' : 'Strong'
            });
        }
    }
    return repeating;
};

export const detectArrows = (counts: Record<number, number>): LoShuArrow[] => {
    const arrows: LoShuArrow[] = [];

    ARROW_DEFINITIONS.forEach(def => {
        const presentCount = def.numbers.filter(num => counts[num] > 0).length;

        if (presentCount === 3) {
            arrows.push({
                ...def,
                type: 'strength'
            });
        } else if (presentCount === 0) {
            arrows.push({
                ...def,
                type: 'weakness',
                meaning: `Challenges in ${def.name.toLowerCase()}. ${def.meaning}`
            });
        }
    });

    return arrows;
};
