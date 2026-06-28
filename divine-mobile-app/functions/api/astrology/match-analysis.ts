interface Env {
  ANTHROPIC_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { groomData, brideData, groomRawText, brideRawText } = await context.request.json() as any;

    if (!groomData || !brideData) {
      return new Response(JSON.stringify({ error: "Missing groom or bride data" }), { status: 400 });
    }

    const apiKey = context.env.ANTHROPIC_API_KEY;
    const isPlaceholderKey = !apiKey || apiKey.includes("your_anthropic_api_key_here");

    // [DEV ONLY] Return a rich mock if no valid key is provided
    if (isPlaceholderKey) {
      return new Response(JSON.stringify({
        groomName: groomData.name || "Groom",
        brideName: brideData.name || "Bride",
        emotionalHarmony: "This is a [DEV MOCK] response. The Moon signs indicate a profound emotional resonance. Both individuals share a deep, intuitive understanding of each other's emotional needs. The Water-Earth element combination brings stability and nurturing energy to the union.",
        practicalCompatibility: "From a practical standpoint, the charts show a strong alignment in life goals. The groom's intellectual approach beautifully complements the bride's pragmatic nature, creating a balanced partnership for long-term planning and wealth accumulation.",
        physicalChemistry: "The elemental combination suggests intense and lasting physical chemistry. There is a strong magnetic attraction indicated by the alignment of Venus and Mars between the two charts.",
        manglikDoshaAnalysis: "The Manglik Dosha is present but naturally cancelled (Mangal Dosha Parihara) due to the specific placement of Mars and aspect of Jupiter, making this a highly favorable match.",
        d9NavamsaIndications: "In the Navamsa (D9) chart, the lords of the 7th house are mutually well-placed, suggesting that the marriage will grow stronger over time and bring spiritual elevation to both.",
        strengths: ["Excellent emotional understanding", "Strong financial alignment", "Mutual respect and shared values", "Complementary communication styles"],
        cautionAreas: ["Need to manage work-life balance", "Occasional stubbornness during disagreements", "Importance of giving each other personal space"],
        finalVerdict: "This is a highly auspicious and harmonious match. The charts show strong potential for a successful, long-lasting marriage built on trust, love, and mutual growth. Blessings of the divine are present.",
        recommendationRating: 9
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are an expert Vedic Astrologer specializing in Janam Kundali matching (Ashtakoot Milan, Mangal Dosha, and emotional compatibility).
You will be provided with the extracted chart data and raw PDF text for a Groom and a Bride.
Your task is to analyze their compatibility deeply and return a structured JSON response.

The JSON format MUST exactly match this TypeScript interface:
{
  "groomName": "string",
  "brideName": "string",
  "emotionalHarmony": "string (detailed paragraph about emotional/moon compatibility)",
  "practicalCompatibility": "string (detailed paragraph about practical life, communication, and intellect)",
  "physicalChemistry": "string (detailed paragraph about physical attraction, yoni compatibility, and passion)",
  "manglikDoshaAnalysis": "string (detailed paragraph analyzing Manglik presence in both charts and if it cancels or needs attention)",
  "d9NavamsaIndications": "string (optional paragraph if you can extract Navamsa clues, else omit)",
  "strengths": ["string", "string", ...],
  "cautionAreas": ["string", "string", ...],
  "finalVerdict": "string (a concluding paragraph with a definitive spiritual/astrological verdict)",
  "recommendationRating": number (1 to 10 scale)
}

Do not include markdown blocks like \`\`\`json, just return the raw JSON object. Use the deterministic 'groomData' and 'brideData' as your primary source of truth, but if details are missing, you may search the 'groomRawText' and 'brideRawText' for clues.`;

    const userPrompt = `
GROOM EXTRACTED DATA:
${JSON.stringify(groomData, null, 2)}

GROOM RAW TEXT (First few pages):
${groomRawText?.slice(0, 3000) || "None provided"}

BRIDE EXTRACTED DATA:
${JSON.stringify(brideData, null, 2)}

BRIDE RAW TEXT (First few pages):
${brideRawText?.slice(0, 3000) || "None provided"}

Analyze the match and return the required JSON.`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": context.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4
      })
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500 });
    }

    const data = await claudeResponse.json() as any;
    let textOutput = data.content[0].text.trim();
    
    // Remove potential markdown code blocks if the AI ignored the instruction
    if (textOutput.startsWith("```json")) {
      textOutput = textOutput.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (textOutput.startsWith("```")) {
      textOutput = textOutput.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const matchAnalysis = JSON.parse(textOutput);

    return new Response(JSON.stringify(matchAnalysis), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Error in match-analysis:", error.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
