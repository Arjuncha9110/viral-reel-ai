import { reduceToSingleDigit } from "../core";

export type VehicleNumerologyStatus = "Lucky" | "Neutral" | "Unlucky";

export interface VehicleNumerologyResult {
  original: string;
  digits: string;
  sum: number;
  reduced: number; // VSD
  status: VehicleNumerologyStatus;
  explanation: string;
  suggestion: string;
  isAscending: boolean;
  // Personalization fields
  lifePathNumber?: number;
  isCompatible?: boolean;
}

const NUMBER_MEANINGS: Record<number, { explanation: string, suggestion: string }> = {
  1: {
    explanation: "Number 1 represents leadership, independence, and strong forward momentum. It is excellent for personal vehicles and business executives.",
    suggestion: "A great number for taking initiative. Keep the vehicle well-maintained to reflect its premium energy."
  },
  2: {
    explanation: "Number 2 embodies balance, partnership, and harmony. While not the most aggressive number, it is very safe and reliable.",
    suggestion: "Ideal for family cars. Maintain a peaceful environment inside the vehicle."
  },
  3: {
    explanation: "Number 3 is ruled by Jupiter, bringing expansion, creativity, and good fortune. It attracts wealth and positive journeys.",
    suggestion: "Excellent for long journeys and expanding your horizons. Keep the energy light and joyous."
  },
  4: {
    explanation: "Number 4 is associated with Rahu, indicating sudden changes, obstacles, and unpredictable events. It requires more discipline.",
    suggestion: "Drive with extra caution. It is recommended to perform regular vehicle blessings or keep a protective yantra in the car."
  },
  5: {
    explanation: "Number 5 is ruled by Mercury, representing speed, communication, and adaptability. Great for frequent travelers and commercial vehicles.",
    suggestion: "Perfect for business travel. Ensure the vehicle's mechanics and electronics are always top-notch."
  },
  6: {
    explanation: "Number 6 is ruled by Venus, symbolizing luxury, comfort, and beauty. It brings a smooth, luxurious, and safe riding experience.",
    suggestion: "Keep the vehicle clean, aesthetically pleasing, and comfortable. It attracts positive social interactions."
  },
  7: {
    explanation: "Number 7 represents spirituality, introspection, and mysticism. It is safe but may lead to solitary journeys or deep thoughts while driving.",
    suggestion: "Great for solo travelers or spiritual seekers. Avoid driving when overly distracted by thoughts."
  },
  8: {
    explanation: "Number 8 is ruled by Saturn, bringing delays, hurdles, and slow progress. It demands extreme discipline and can attract accidents if careless.",
    suggestion: "Always follow traffic rules strictly. Avoid aggressive driving and keep all vehicle documentation perfectly updated."
  },
  9: {
    explanation: "Number 9 is ruled by Mars, offering immense energy, protection, and courage. It ensures completion of journeys and wards off negativity.",
    suggestion: "Excellent for adventurous or heavy-duty vehicles. Channel the fiery energy safely."
  }
};

const COMPATIBILITY_MATRIX: Record<number, number[]> = {
  1: [1, 3, 5, 9],
  2: [1, 3, 6, 8],
  3: [1, 3, 6, 9],
  4: [1, 5, 6, 7],
  5: [1, 3, 5, 6, 8],
  6: [1, 3, 5, 6, 9],
  7: [1, 5, 6],
  8: [1, 3, 5, 6],
  9: [1, 3, 5, 9]
};

const calculateLPN = (dobString: string): number | undefined => {
  const digitsOnly = dobString.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 8) return undefined; // Need at least DDMMAAAA or similar full date

  let sum = digitsOnly.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9) {
    sum = sum.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
};

export const calculateVehicleNumerology = (vehicleNumber: string, dobString?: string): VehicleNumerologyResult | null => {
  const cleaned = vehicleNumber.trim().toUpperCase();
  const allDigits = cleaned.replace(/[^0-9]/g, "");

  if (!allDigits) return null;

  // Extract only the last 4 digits as per Indian standard vehicle registration rules
  const digitsOnly = allDigits.slice(-4);

  const sum = digitsOnly.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  
  // VSD (Vehicle Single Digit)
  let reduced = sum;
  while (reduced > 9) {
    reduced = reduced.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  const meaning = NUMBER_MEANINGS[reduced];
  
  // Check for ascending sequences (e.g. 1234)
  let isAscending = false;
  if (digitsOnly.length >= 3) {
    let ascCount = 0;
    for (let i = 0; i < digitsOnly.length - 1; i++) {
      if (parseInt(digitsOnly[i+1]) === parseInt(digitsOnly[i]) + 1) {
        ascCount++;
      }
    }
    if (ascCount >= 2) isAscending = true; // e.g. 123 is ascending
  }

  // Personalization
  let lifePathNumber: number | undefined;
  let isCompatible: boolean | undefined;
  let personalLucky: number[] | undefined;
  let personalNeutral: number[] | undefined;
  let personalUnlucky: number[] | undefined;
  
  let status: VehicleNumerologyStatus = "Neutral";
  const luckyNumbers = [1, 3, 6, 7, 9];
  const carefulNumbers = [4, 8];

  if (dobString) {
    lifePathNumber = calculateLPN(dobString);
    if (lifePathNumber) {
      personalLucky = COMPATIBILITY_MATRIX[lifePathNumber] || [];
      
      const enemies: Record<number, number[]> = {
        1: [6, 8],
        2: [4, 8, 9],
        3: [4, 8],
        4: [2, 4, 8],
        5: [2, 4, 8],
        6: [2, 4, 8],
        7: [2, 4, 8, 9],
        8: [2, 4, 8, 9],
        9: [2, 4, 8]
      };
      
      let unluckySet = new Set(enemies[lifePathNumber] || []);
      if (!personalLucky.includes(4)) unluckySet.add(4);
      if (!personalLucky.includes(8)) unluckySet.add(8);
      
      personalUnlucky = Array.from(unluckySet).filter(n => !personalLucky!.includes(n)).sort((a,b) => a-b);
      personalNeutral = [1,2,3,4,5,6,7,8,9].filter(n => !personalLucky!.includes(n) && !personalUnlucky!.includes(n));

      if (personalLucky.includes(reduced)) {
        isCompatible = true;
        status = "Lucky";
      } else if (personalUnlucky.includes(reduced)) {
        isCompatible = false;
        status = "Unlucky";
      } else {
        isCompatible = undefined; // Neutral match
        status = "Neutral";
      }
    }
  }

  // General classification if no DOB
  if (!dobString || !lifePathNumber) {
    if (luckyNumbers.includes(reduced)) {
      status = "Lucky";
    } else if (carefulNumbers.includes(reduced)) {
      status = "Unlucky";
    }
  }

  // Ascending sequences are always generally lucky unless contradicted strictly by DOB incompatibility
  if (isAscending && isCompatible !== false) {
    status = "Lucky";
  }

  return {
    original: cleaned,
    digits: digitsOnly, // This now reflects only the last 4 digits
    sum,
    reduced,
    status,
    explanation: meaning?.explanation || "",
    suggestion: meaning?.suggestion || "",
    isAscending,
    lifePathNumber,
    isCompatible,
    personalLucky,
    personalNeutral,
    personalUnlucky
  };
};
