export interface MonthForecast {
  monthName: string;      // e.g. "May 2026"
  theme: string;          // e.g. "Self & Focus"
  prediction: string;     // Detailed prediction
  guidance: string;       // Actionable practical guidance
  caution: string;        // Watch out details
  bestAction: string;     // Recommended specific activity
}

/**
 * Dynamically generates a highly personalized 12-month transit forecast starting from the report generation month.
 */
export function generateTransitForecast({
  rashiName,
  currentMaha,
  generationDate = new Date()
}: {
  rashiName: string;
  currentMaha: string;
  generationDate?: Date;
}): MonthForecast[] {
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const startMonth = generationDate.getMonth();
  const startYear = generationDate.getFullYear();
  
  const forecastTemplates = [
    {
      theme: "Self & Focus",
      prediction: `With the Lord of Rashi ${rashiName} casting its favorable aspect, you enter a period of high clarity. This is an exceptional time for self-discovery, setting personal goals, and focusing heavily on your physical well-being. Your energetic aura is strong under the ${currentMaha} Mahadasha influence.`,
      guidance: "Begin a new fitness routine or dedicate 15 minutes to silent meditation every morning to anchor your focus.",
      caution: "Avoid overcommitting your time to others; protect your personal boundaries and conserve energy.",
      bestAction: "Write down your personal vision and goals for the next 12 months in a journal."
    },
    {
      theme: "Wealth & Speech",
      prediction: "Planetary alignments trigger focus on your second house of finances and speech. A strong period for budgeting, financial restructuring, and engaging in constructive family talks. Your words carry serious weight and persuasive power now.",
      guidance: "Express yourself with kindness and precision; negotiate any outstanding financial terms or contracts.",
      caution: "Steer clear of speculative investments or impulsive high-value purchases.",
      bestAction: "Create a detailed monthly budget tracker and review your long-term savings plan."
    },
    {
      theme: "Siblings & Short Travel",
      prediction: "Energetic movement highlights your third house of courage, brothers/sisters, and short journeys. Excellent transit for writing, communications, and embarking on productive weekend travel. Clear up any lingering misunderstandings with close colleagues.",
      guidance: "Reach out to siblings or neighbors, and pitch your creative ideas to peers.",
      caution: "Do not rush while driving or walking; keep calm during heated debates.",
      bestAction: "Take a short weekend trip into nature to rejuvenate your creative spirit."
    },
    {
      theme: "Mother, Home & Comforts",
      prediction: "Comfort and emotional satisfaction peak as planets transit your fourth house. A fantastic time for domestic harmony, resolving family matters, and making updates to your living space. The nurturing presence of your mother or a maternal figure brings great peace.",
      guidance: "Invest quality time in home activities and create a comforting sanctuary at home.",
      caution: "Avoid household arguments; do not let minor property matters disrupt your peace of mind.",
      bestAction: "Declutter your living room and add fresh plants or pleasant aromas to enhance home energy."
    },
    {
      theme: "Creativity, Children & Romance",
      prediction: "The fifth house of divine intelligence, creative expression, and children is highly activated. Your creative spark burns brightly, making this a wonderful phase for learning, starting artistic pursuits, or enjoying quality time with kids. Romantic prospects receive cosmic blessings.",
      guidance: "Engage in hobbies that bring you pure joy, and listen to the innovative ideas of children.",
      caution: "Keep your emotions grounded in romantic relationships; avoid speculative gambles.",
      bestAction: "Spend an afternoon drawing, painting, writing poetry, or playing a creative game."
    },
    {
      theme: "Health, Work & Obstacles",
      prediction: "Cosmic energies focus heavily on your sixth house of daily routines, health, and service. You are empowered to resolve long-standing obstacles, overcome rivals, and clean up your lifestyle habits. Pay close attention to digestive health and physical fitness.",
      guidance: "Prioritize nutrient-dense foods, stay hydrated, and simplify your daily work schedule.",
      caution: "Avoid taking on unnecessary new debts or engaging in litigation or disputes.",
      bestAction: "Schedule a routine health check-up and organize your daily work desk."
    },
    {
      theme: "Partnerships & Alliances",
      prediction: "Jupiter and Venus cast supportive glances over your seventh house of partnerships. A highly favorable period for personal commitments, marriages, business alliances, and signing collaborative contracts. Public interaction yields great mutual benefits.",
      guidance: "Foster transparent communication with your partner, and remain receptive to collaborations.",
      caution: "Avoid dominant behaviors in close relationships; strive for absolute equity.",
      bestAction: "Plan a special dinner or collaborative strategy session with your partner or co-worker."
    },
    {
      theme: "Subconscious & Transformation",
      prediction: "Deep transformation occurs as cosmic currents shift into your eighth house. Excellent time for psychological healing, researching esoteric subjects, and uncovering hidden assets. Spiritual practices like Pranayama and meditation yield profound inner revelations.",
      guidance: "Embrace personal transitions and let go of habits that no longer serve your growth.",
      caution: "Keep your personal plans confidential; avoid dark or stressful environments.",
      bestAction: "Practice deep breathing or explore a research book on history, psychology, or Vedic secrets."
    },
    {
      theme: "Grace & Higher Wisdom",
      prediction: "Dharma activities bring exceptional grace to your ninth house of fortune, father figures, and higher learning. A highly auspicious transit that elevates your spiritual wisdom. You may connect with a profound mentor or embark on a pilgrimage.",
      guidance: "Engage in charitable deeds, seek the blessings of elders, and expand your spiritual horizons.",
      caution: "Do not judge others' beliefs; maintain humility in your philosophical discussions.",
      bestAction: "Donate to a spiritual or educational cause, and seek advice from a respected mentor."
    },
    {
      theme: "Career & Status",
      prediction: "Planetary placements in your tenth house enhance your status, professional authority, and public fame. Expect strong support from superiors, career recognition, or promotion opportunities. Your leadership skills are highly respected now.",
      guidance: "Take charge of major projects and execute your professional duties with absolute integrity.",
      caution: "Do not let professional pride create distance between you and your team members.",
      bestAction: "Update your resume or professional profile and schedule a career strategy meeting."
    },
    {
      theme: "Income & Social Network",
      prediction: "Your desires find their fulfillment as planets light up your eleventh house of gains and friendships. Your social network expands dynamically, leading to multiple sources of unexpected income or professional rewards. Great support from elder siblings.",
      guidance: "Connect with progressive groups, and share your success stories with close friends.",
      caution: "Select your close associates wisely; avoid gossip and shallow networking circles.",
      bestAction: "Host a small gathering with friends or attend a professional networking event."
    },
    {
      theme: "Spirituality & Meditation",
      prediction: "Planetary transits anchor your twelfth house of solitude, meditation, and expenditure. This period highlights spiritual clearing, dream analysis, and selfless service. Perfect phase for retreat, checking your expenses, and practicing letting go.",
      guidance: "Ensure deep restful sleep, focus heavily on charity, and practice silent mindfulness.",
      caution: "Monitor your spending closely; stay away from impulsive overseas travel commitments.",
      bestAction: "Dedicate an hour before sleep to complete digital detox and silent introspection."
    }
  ];
  
  const forecasts: MonthForecast[] = [];
  
  for (let i = 0; i < 12; i++) {
    const currentMonthIdx = (startMonth + i) % 12;
    const yearOffset = Math.floor((startMonth + i) / 12);
    const targetYear = startYear + yearOffset;
    
    const monthName = `${monthsList[currentMonthIdx]} ${targetYear}`;
    const template = forecastTemplates[i];
    
    forecasts.push({
      monthName,
      theme: template.theme,
      prediction: template.prediction,
      guidance: template.guidance,
      caution: template.caution,
      bestAction: template.bestAction
    });
  }
  
  return forecasts;
}
