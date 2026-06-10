import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { ExtractedKundliData } from "./types";

// Ensure the worker is set up
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractKundliPdfData(file: File): Promise<ExtractedKundliData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    // Read first 3 pages usually enough for birth details and basic chart
    const numPages = Math.min(3, pdf.numPages);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str.trim())
        .filter(str => str.length > 0)
        .join("\n");
      fullText += pageText + "\n";
    }

    const lines = fullText.split("\n").map(l => l.trim()).filter(Boolean);

    const extractNextLine = (label: string): string | null => {
      // Find the label in the array, then return the very next line
      const idx = lines.findIndex(l => l.toLowerCase() === label.toLowerCase() || l.toLowerCase().startsWith(label.toLowerCase() + ":"));
      if (idx !== -1 && idx + 1 < lines.length) {
        let val = lines[idx + 1];
        // If it starts with the label (e.g., "Name: John"), extract John
        if (lines[idx].includes(":") && lines[idx].split(":")[1].trim()) {
           return lines[idx].split(":")[1].trim();
        }
        return val;
      }
      return null;
    };

    const name = extractNextLine("Full Name") || extractNextLine("Name") || extractNextLine("ಹೆಸರು") || "Unknown";
    const dateOfBirth = extractNextLine("Date of Birth") || extractNextLine("ಜನ್ಮ ದಿನಾಂಕ") || "Unknown";
    const timeOfBirth = extractNextLine("Time of Birth") || extractNextLine("ಜನ್ಮ ಸಮಯ") || "Unknown";
    const placeOfBirth = extractNextLine("Birth Location") || extractNextLine("Birth Place") || extractNextLine("ಜನ್ಮ ಸ್ಥಳ") || "Unknown";
    
    // In the PDF, these are usually labels followed by the value
    const lagna = extractNextLine("Lagna Ascendant") || extractNextLine("Ascendant (Lagna)") || extractNextLine("ಲಗ್ನ") || extractNextLine("Lagna") || "Unknown";
    const moonSign = extractNextLine("Moon Sign (Rashi)") || extractNextLine("Moon Sign") || extractNextLine("ಚಂದ್ರ ರಾಶಿ") || "Unknown";
    
    // Extract Nakshatra
    let nakshatra = extractNextLine("Nakshatra (Pada)") || extractNextLine("Nakshatra") || extractNextLine("ನಕ್ಷತ್ರ") || "Unknown";
    let nakshatraPada = extractNextLine("Nakshatra Pada") || extractNextLine("ನಕ್ಷತ್ರ ಪಾದ") || "Unknown";
    
    // If nakshatra is like "Revati (Pada 4)", split it for cleanliness
    if (nakshatra.includes("(Pada")) {
      const parts = nakshatra.split("(Pada");
      nakshatra = parts[0].trim();
      nakshatraPada = parts[1].replace(")", "").trim();
    }

    // TODO: Advanced planetary extraction can be complex from plain text. 
    // We will extract what we reliably can, and let Claude interpret the raw text dump if needed.
    
    // Find Manglik Status (if printed in the first few pages)
    let manglikStatus = "Unknown";
    if (fullText.toLowerCase().includes("manglik") || fullText.toLowerCase().includes("mangal dosha")) {
      const manglikLine = lines.find(l => l.toLowerCase().includes("manglik") || l.toLowerCase().includes("mangal dosha"));
      if (manglikLine) manglikStatus = manglikLine;
    }

    return {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      lagna,
      moonSign,
      nakshatra,
      nakshatraPada,
      planets: [], // Empty for now, we rely on the backend AI to parse deeper structures from the raw text if we send it
      manglikStatus,
      isAvailable: true
    };
    
  } catch (err) {
    console.error("PDF Extraction failed:", err);
    return {
      name: "Unavailable",
      dateOfBirth: "Unavailable",
      timeOfBirth: "Unavailable",
      placeOfBirth: "Unavailable",
      lagna: "Unavailable",
      moonSign: "Unavailable",
      nakshatra: "Unavailable",
      planets: [],
      isAvailable: false
    };
  }
}

// We will also export a raw text extractor to feed to the AI for full interpretation
export async function extractRawKundliPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str.trim())
        .filter(str => str.length > 0)
        .join("\n");
      fullText += `--- PAGE ${i} ---\n${pageText}\n`;
    }
    return fullText;
  } catch (err) {
    return "";
  }
}
