import { soundVibrationMap } from "../../data/soundVibrationMap";

export const detectNameSoundVibration = (name: string) => {
    if (!name || name.trim().length === 0) {
        return {
            dominantSound: "",
            beej: "OM",
            planet: "Neutral",
            chakra: "Balanced",
            traits: [],
            mantra: "ॐ",
            remedies: []
        };
    }

    const clean = name.toLowerCase().trim();

    // Try to find a match based on startsWith or endsWith
    for (const map of soundVibrationMap) {
        const matchedSound = map.sounds.find(s => clean.startsWith(s) || clean.endsWith(s));

        if (matchedSound) {
            return {
                dominantSound: matchedSound,
                beej: map.beej,
                planet: map.planet,
                chakra: map.chakra,
                traits: map.traits,
                mantra: map.mantra,
                remedies: map.remedies
            };
        }
    }

    // Fallback
    return {
        dominantSound: "",
        beej: "OM",
        planet: "Jupiter",
        chakra: "Crown",
        traits: ["wisdom", "growth", "expansion"],
        mantra: "ॐ",
        remedies: ["Daily meditation", "Listen to spiritual music"]
    };
};
