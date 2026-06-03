import { jsPDF } from "jspdf";

const KANNADA_REGULAR_URL = "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf";
const KANNADA_BOLD_URL = "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansKannada/NotoSansKannada-Bold.ttf";

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof window === "undefined") {
    return Buffer.from(binary, "binary").toString("base64");
  }
  return window.btoa(binary);
};

/**
 * Dynamically streams Noto Sans Kannada font from a public CDN,
 * registers it to the jsPDF document's VFS, and sets it up.
 * If offline or if the fetch fails/times out, returns false so
 * the PDF falls back gracefully to standard English.
 */
export const loadKannadaFont = async (doc: jsPDF): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Font fetch timed out")), 3500)
    );

    const fetchFonts = async (): Promise<boolean> => {
      const [regRes, boldRes] = await Promise.all([
        fetch(KANNADA_REGULAR_URL),
        fetch(KANNADA_BOLD_URL)
      ]);

      if (!regRes.ok || !boldRes.ok) {
        throw new Error("Failed to download Noto Sans Kannada font from CDN");
      }

      const [regBuf, boldBuf] = await Promise.all([
        regRes.arrayBuffer(),
        boldRes.arrayBuffer()
      ]);

      const regBase64 = arrayBufferToBase64(regBuf);
      const boldBase64 = arrayBufferToBase64(boldBuf);

      // Register regular weight font
      doc.addFileToVFS("NotoSansKannada-Regular.ttf", regBase64);
      doc.addFont("NotoSansKannada-Regular.ttf", "NotoSansKannada", "normal");

      // Register bold weight font
      doc.addFileToVFS("NotoSansKannada-Bold.ttf", boldBase64);
      doc.addFont("NotoSansKannada-Bold.ttf", "NotoSansKannada", "bold");

      return true;
    };

    return await Promise.race([fetchFonts(), timeoutPromise]);
  } catch (error) {
    console.warn("Kannada font loader failed, falling back to standard English fonts:", error);
    return false;
  }
};
