export interface NameInterpretation {
    summary: string;
    expression: string;
    soul: string;
    personality: string;
    strengths: string[];
    weaknesses: string[];
    themes: string;
}

export const nameInterpretations: Record<number, NameInterpretation> = {
    1: {
        summary: "The Pioneer - Independence and Leadership.",
        expression: "You are destined to be a leader, an innovator, and a self-starter. Your name vibrates with the energy of new beginnings.",
        soul: "Deep down, you crave independence and the freedom to lead. You are motivated by personal achievement and recognition.",
        personality: "Others see you as a strong, confident, and sometimes dominant individual. You appear self-reliant and assertive.",
        strengths: ["Initiative", "Determination", "Courage", "Originality"],
        weaknesses: ["Aggression", "Impatience", "Egotism"],
        themes: "Commanding roles, entrepreneurship, and pioneering new fields."
    },
    2: {
        summary: "The Diplomat - Harmony and Cooperation.",
        expression: "Your path is one of peace and partnership. You excel at bringing people together and finding balance.",
        soul: "You desire emotional connection and harmony. You are most fulfilled when you are part of a supportive team or relationship.",
        personality: "You come across as gentle, tactful, and approachable. People find you easy to talk to and trust your intuition.",
        strengths: ["Diplomacy", "Sensitivity", "Patience", "Cooperation"],
        weaknesses: ["Oversensitivity", "Indecision", "Dependency"],
        themes: "Mediation, counseling, arts, and collaborative ventures."
    },
    3: {
        summary: "The Creative - Expression and Joy.",
        expression: "You are here to express yourself and bring joy to others through creativity, communication, or art.",
        soul: "Your heart is filled with a desire to create and inspire. You are motivated by self-expression and social connection.",
        personality: "You are perceived as charming, witty, and optimistic. Your presence lightens the room and attracts friends easily.",
        strengths: ["Imagination", "Communication", "Enthusiasm", "Artistry"],
        weaknesses: ["Scattered focus", "Exaggeration", "Lack of discipline"],
        themes: "Entertainment, writing, design, and public relations."
    },
    4: {
        summary: "The Builder - Structure and Reliability.",
        expression: "Your name represents stability, hard work, and the ability to build lasting foundations.",
        soul: "You find security in order and logic. You are driven by a need for stability and a sense of accomplishment through effort.",
        personality: "Others see you as reliable, practical, and grounded. You appear as the person to go to when things need to get done.",
        strengths: ["Persistence", "Organization", "Practicality", "Loyalty"],
        weaknesses: ["Rigidity", "Stubbornness", "Narrow-mindedness"],
        themes: "Engineering, management, finance, and system design."
    },
    5: {
        summary: "The Adventurer - Freedom and Change.",
        expression: "Your energy is dynamic and versatile. You thrive on change, travel, and experiencing the world from all angles.",
        soul: "You long for freedom and variety. You are motivated by curiosity and the thrill of new experiences.",
        personality: "You strike others as charismatic, adaptable, and full of life. You appear to be always moving and exploring.",
        strengths: ["Versatility", "Resourcefulness", "Charm", "Quick thinking"],
        weaknesses: ["Restlessness", "Inconsistency", "Irresponsibility"],
        themes: "Sales, travel, media, and marketing."
    },
    6: {
        summary: "The Nurturer - Responsibility and Care.",
        expression: "You are the caretaker, the teacher, and the one who creates harmony in the home and community.",
        soul: "Your heart's desire is to serve and protect those you love. You are fulfilled by providing comfort and guidance.",
        personality: "Others perceive you as warm, responsible, and parental. You look like someone who can be trusted with any secret.",
        strengths: ["Compassion", "Responsibility", "Harmony", "Healing"],
        weaknesses: ["Intrusiveness", "Self-sacrifice", "Worrying"],
        themes: "Education, healthcare, counseling, and home-based business."
    },
    7: {
        summary: "The Seeker - Analysis and Spirituality.",
        expression: "Your path involves a deep search for truth, whether through science, philosophy, or spiritual inquiry.",
        soul: "You are driven by a need for solitude and reflection. You seek wisdom and the answers to life's deeper mysteries.",
        personality: "You appear reserved, intellectual, and perhaps a bit mysterious. People see you as a deep thinker and an observer.",
        strengths: ["Analytical mind", "Intuition", "Spiritual depth", "Observation"],
        weaknesses: ["Isolation", "Secretiveness", "Overthinking"],
        themes: "Research, science, technology, and spiritual guidance."
    },
    8: {
        summary: "The Powerhouse - Authority and Abundance.",
        expression: "Your name carries the vibration of material success and the ability to manage large-scale organizations or projects.",
        soul: "You are motivated by power, status, and material achievement. You want to see your efforts manifest in the real world.",
        personality: "Others see you as authoritative, efficient, and successful. You appear as a natural leader in business or finance.",
        strengths: ["Ambition", "Efficiency", "Judgment", "Organization"],
        weaknesses: ["Materialism", "Dominance", "Workaholism"],
        themes: "Business management, law, politics, and finance."
    },
    9: {
        summary: "The Humanitarian - Universal Love.",
        expression: "Your path is one of selfless service, compassion, and working for the benefit of all humanity.",
        soul: "Your deepest motivation is to help others and leave the world better than you found it. You act from a place of idealism.",
        personality: "You are perceived as generous, broad-minded, and wise. You strike people as someone who cares deeply about everyone.",
        strengths: ["Tolerance", "Compassion", "Selflessness", "Broad vision"],
        weaknesses: ["Impracticality", "Emotionalism", "Detachment"],
        themes: "Humanitarian work, arts, medicine, and social reform."
    },
    11: {
        summary: "The Visionary (Master) - Illumination.",
        expression: "As a Master Number 11, you are a channel for higher insight and an inspiration to those around you.",
        soul: "You are driven by a spiritual mission to illuminate and heal. You crave profound connections and spiritual truths.",
        personality: "You appear charismatic, sensitive, and uniquely gifted. You have an aura of 'otherworldliness' and insight.",
        strengths: ["Heightened intuition", "Inspiration", "Vision", "Self-awareness"],
        weaknesses: ["Nervous tension", "Extreme sensitivity", "Self-doubt"],
        themes: "Spiritual teaching, innovation, and creative inspiration."
    },
    22: {
        summary: "The Master Builder (Master) - Manifestation.",
        expression: "The most powerful vibration, you have the potential to turn grand visions into tangible reality on a global scale.",
        soul: "You are driven to build something that lasts. You want to manifest large-scale projects that benefit humanity.",
        personality: "Others see you as an immense power and a disciplined genius. You appear as someone capable of anything.",
        strengths: ["Pragmatic dreamer", "Discipline", "Mastery", "Vision"],
        weaknesses: ["Overwhelming pressure", "Perfectionism", "Ruthlessness"],
        themes: "Architecture, international business, and social transformation."
    },
    33: {
        summary: "The Master Teacher (Master) - Devotion.",
        expression: "The vibration of unconditional love and spiritual devotion. You are here to serve as a guide and healer for all.",
        soul: "Your heart overflows with compassion and the desire to uplift the world. You are motivated by pure service and love.",
        personality: "You come across as an enlightened soul, radiating kindness, wisdom, and immense healing energy.",
        strengths: ["Altruism", "Nurturing", "Spiritual devotion", "Compassion"],
        weaknesses: ["Martyrdom", "Emotional burden", "Over-responsibility"],
        themes: "Global healing, spiritual leadership, and master level teaching."
    }
};
