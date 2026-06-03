/**
 * Pre-translation helper for Kannada PDF generation.
 *
 * Collects all dynamic English strings that will appear in the PDF,
 * batches them to /api/translate, and populates a runtime cache so
 * the synchronous t() function can return Kannada text without blocking.
 */

import { KANNADA_DICT } from "./kannadaTranslations";

/** Runtime translation cache — persists for the browser session */
const runtimeCache: Record<string, string> = {};

/** Merge a batch of translations into the runtime cache */
export function mergeTranslations(pairs: Record<string, string>) {
  Object.assign(runtimeCache, pairs);
}

/** Look up a string — runtime cache first, then static dict */
export function lookupTranslation(text: string): string | undefined {
  if (!text) return undefined;
  const clean = text.trim();
  return runtimeCache[clean] ?? runtimeCache[text] ?? KANNADA_DICT[clean] ?? KANNADA_DICT[text];
}

function decodeHtmlEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function containsTranslatableLatin(text: string) {
  return /[A-Za-z]/.test(text);
}

export function shouldPreserveSourceText(text: string) {
  const clean = text.trim();
  if (!clean) return true;

  if (/^[A-Za-z_]+\/[A-Za-z_]+$/.test(clean)) {
    return true;
  }

  if (/(?:[a-z0-9-]+\.)+[a-z]{2,}/i.test(clean) || clean.includes("@")) {
    return true;
  }

  return false;
}

function hasMeaningfulTranslation(source: string[], translated: string[]) {
  return translated.some((item, index) => item && item !== source[index]);
}

async function translateBatchViaFunction(texts: string[], target: string): Promise<string[] | null> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, target }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { translations?: string[] };
    const translations = (json.translations ?? texts).map(decodeHtmlEntities);
    return hasMeaningfulTranslation(texts, translations) ? translations : null;
  } catch {
    return null;
  }
}

function splitLongText(text: string, maxChars = 420): string[] {
  const lines = text.split("\n");
  const output: string[] = [];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) {
      output.push("");
      continue;
    }

    if (cleanLine.length <= maxChars) {
      output.push(cleanLine);
      continue;
    }

    const sentences = cleanLine.split(/(?<=[.!?])\s+/);
    let current = "";
    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length <= maxChars) {
        current = next;
      } else {
        if (current) output.push(current);
        if (sentence.length <= maxChars) {
          current = sentence;
        } else {
          for (let i = 0; i < sentence.length; i += maxChars) {
            output.push(sentence.slice(i, i + maxChars));
          }
          current = "";
        }
      }
    }
    if (current) output.push(current);
  }

  return output;
}

async function translateSingleTextViaPublicGoogle(text: string, target: string): Promise<string> {
  if (!text.trim() || !containsTranslatableLatin(text) || shouldPreserveSourceText(text)) return text;

  const segments = splitLongText(text);
  const translatedSegments = await Promise.all(
    segments.map(async (segment) => {
      if (!segment || !containsTranslatableLatin(segment) || shouldPreserveSourceText(segment)) {
        return segment;
      }

      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(segment)}`;
        const res = await fetch(url);
        if (!res.ok) {
          return segment;
        }

        const json = (await res.json()) as unknown;
        const translated = Array.isArray(json) && Array.isArray(json[0])
          ? (json[0] as unknown[]).map((part) => Array.isArray(part) ? String(part[0] ?? "") : "").join("")
          : segment;

        return decodeHtmlEntities(translated) || segment;
      } catch {
        return segment;
      }
    })
  );

  return translatedSegments.join("\n");
}

async function translateBatchViaPublicGoogle(texts: string[], target: string): Promise<string[]> {
  const results = new Array<string>(texts.length);
  const concurrency = 24;

  for (let start = 0; start < texts.length; start += concurrency) {
    const batch = texts.slice(start, start + concurrency);
    const translatedBatch = await Promise.all(
      batch.map((text) => translateSingleTextViaPublicGoogle(text, target))
    );

    for (let index = 0; index < translatedBatch.length; index += 1) {
      results[start + index] = translatedBatch[index];
    }
  }

  return results;
}

/** Translate a batch of strings via local function first, then a public-browser fallback */
async function translateBatch(texts: string[], target: string): Promise<string[]> {
  const localTranslations = await translateBatchViaFunction(texts, target);
  if (localTranslations) {
    return localTranslations;
  }

  if (target === "en") {
    return texts;
  }

  return translateBatchViaPublicGoogle(texts, target);
}

export async function translateStrings(
  texts: string[],
  targetLang: string,
  onProgress?: (progress: number) => void
): Promise<Record<string, string>> {
  if (targetLang === "en" || texts.length === 0) return {};

  const uniqueTexts = Array.from(
    new Set(
      texts
        .map((text) => text.trim())
        .filter((text) => text && !shouldPreserveSourceText(text))
    )
  );

  const BATCH = 180;
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueTexts.length; i += BATCH) {
    chunks.push(uniqueTexts.slice(i, i + BATCH));
  }

  const pairs: Record<string, string> = {};
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const translations = await translateBatch(chunk, targetLang);

    for (let j = 0; j < chunk.length; j++) {
      const source = chunk[j];
      const translated = translations[j] ? decodeHtmlEntities(translations[j]) : source;
      if (translated && translated !== source) {
        pairs[source] = translated;
      }
    }

    onProgress?.((i + 1) / chunks.length);
  }

  mergeTranslations(pairs);
  return pairs;
}

/**
 * Collect every string value from a nested object/array structure.
 * Skips strings that are already in KANNADA_DICT or runtimeCache,
 * and skips very short strings (numbers, abbreviations).
 */
function collectStrings(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    const clean = value.trim();
    if (
      clean.length > 3 &&
      containsTranslatableLatin(clean) &&
      !shouldPreserveSourceText(clean) &&
      !KANNADA_DICT[clean] &&
      !runtimeCache[clean] &&
      !/^[\d°′″\s./:,-]+$/.test(clean)  // skip pure numbers/coords
    ) {
      out.add(clean);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
}

/**
 * Pre-translate all content for the given data objects.
 * Call this BEFORE invoking generateKundaliPdf / generateSadeSatiPdf.
 *
 * @param contentObjects  Array of data objects whose string values need translation
 * @param targetLang      BCP-47 language code, e.g. "kn" for Kannada
 * @param onProgress      Optional progress callback (0–1)
 */
export async function preTranslateContent(
  contentObjects: unknown[],
  targetLang: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (targetLang === "en") return;

  // 1. Collect all untranslated strings
  const needed = new Set<string>();
  for (const obj of contentObjects) collectStrings(obj, needed);

  const strings = Array.from(needed);
  if (strings.length === 0) return;

  await translateStrings(strings, targetLang, onProgress);
}
