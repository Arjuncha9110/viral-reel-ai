import { reduceToSingleDigit } from "../core";

/**
 * Calculates Life Path Number.
 * Method: Reduce Day, Reduce Month, Reduce Year separately, then sum and reduce.
 * Preserves Master Numbers (11, 22, 33) at final stage.
 */
export const calculateLifePathNumber = (birthDate: Date): number => {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();

    // Reduce each component first (Master numbers preserved in intermediate might be debatable, 
    // but standard practice often reduces D/M/Y to single digits/LN first)
    const rDay = reduceToSingleDigit(day, true);
    const rMonth = reduceToSingleDigit(month, true);
    const rYear = reduceToSingleDigit(year, true);

    const sum = rDay + rMonth + rYear;

    return reduceToSingleDigit(sum, true);
};

/**
 * Calculates Destiny Number.
 * Based on full date reduction (some systems call this Expression, but here we treat it as Sum of all digits).
 * Method: Sum of ALL digits in the date string (DDMMYYYY) -> Reduce.
 */
export const calculateDestinyNumber = (birthDate: Date): number => {
    // ISO string is YYYY-MM-DD
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();

    const dateStr = `${day}${month}${year}`;

    const sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    return reduceToSingleDigit(sum, true);
};

/**
 * Calculates Maturity Number.
 * Sum of Life Path + Name Number (Expression).
 */
export const calculateMaturityNumber = (lifePathNumber: number, nameNumber: number): number => {
    return reduceToSingleDigit(lifePathNumber + nameNumber, true);
};
