import { db } from "../firebase/firebase";
import { collection, doc, setDoc, getDocs, query, orderBy, serverTimestamp, addDoc, onSnapshot } from "firebase/firestore";
import { userService } from "./userService";
import { kundliService } from "./kundliService";
import { getTithiData } from "../lib/panchang/astroEngine";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  guideId: string;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  uid: string;
  guideId: string;
  lastMessage: string;
  updatedAt: any;
}

class AiGuideService {
  /**
   * Send a message and get a mocked spiritual response.
   * TODO: In production, this should write the user message and then trigger a 
   * Firebase Cloud Function that securely calls the LLM API and writes the assistant response.
   */
  async sendMessage(uid: string, guideId: string, content: string): Promise<void> {
    const chatId = `${uid}_${guideId}`;
    const messagesRef = collection(db, `users/${uid}/aiChats/${chatId}/messages`);
    const sessionRef = doc(db, `users/${uid}/aiChats/${chatId}`);

    // 1. Write user message
    await addDoc(messagesRef, {
      role: "user",
      content,
      guideId,
      createdAt: serverTimestamp()
    });

    // Update session last message
    await setDoc(sessionRef, {
      id: chatId,
      uid,
      guideId,
      lastMessage: content,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Fetch context
    const profile = await userService.getUserProfile(uid);
    const kundli = await kundliService.getKundli(uid);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Generate mock response
    const name = profile?.displayName?.split(" ")[0] || "Seeker";
    const rashi = kundli?.moonSign || "Unknown Rashi";
    const nakshatra = kundli?.nakshatra || "Unknown Nakshatra";
    const lagna = kundli?.lagna || "Unknown Lagna";
    
    // Today's panchang context
    const today = new Date();
    const tithiData = getTithiData(today);
    const tithi = tithiData.name;

    let responseContent = "";

    switch (guideId) {
      case "vedic-guide":
        responseContent = `Namaste ${name}. I see you are born with ${rashi} Rashi.\n\nToday's energy brings the ${tithi} tithi, which favors quiet reflection and tying up loose ends rather than starting new conflicts.\n\nYou may consider taking a moment for deep breathing and expressing gratitude today.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      case "kundali-guide":
        responseContent = `Greetings ${name}. Looking at your chart, your Lagna is ${lagna} and your Nakshatra is ${nakshatra}. This carries a gentle, intuitive quality.\n\nFor today, focus on grounding your energy. Your chart supports seeking inner peace over external validation.\n\nConsider reflecting on what truly matters to your soul's journey right now.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      case "numerology-guide":
        responseContent = `Hello ${name}. The numbers surrounding your life currently emphasize harmony and patience.\n\nRather than forcing outcomes, allow things to unfold naturally. The vibration of the day suggests a receptive stance.\n\nPerhaps wear something light-colored today to invite clarity.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      case "remedy-guide":
        responseContent = `Namaste ${name}. When feeling uncertain, small actions can shift our internal state powerfully.\n\nYou may consider chanting 'Om Namo Bhagavate Vasudevaya' 11 times and setting one clear, positive intention for the day.\n\nLighting a simple diya or candle this evening can also help clear heavy energies.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      case "relationship-guide":
        responseContent = `Dear ${name}, the celestial energy gently nudges us toward compassion and understanding in our bonds right now.\n\nIf you encounter friction, take a breath before responding. Your ${rashi} Moon encourages nurturing rather than confronting.\n\nConsider journaling your feelings before sharing them to ensure clarity.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      case "career-guide":
        responseContent = `Namaste ${name}. With your ${nakshatra} nature, steady, disciplined effort brings the most lasting rewards.\n\nToday is a good day for planning and refining your skills rather than making impulsive leaps.\n\nTrust in your divine timing and focus on the step directly in front of you.\n\nThis is spiritual guidance for reflection, not a fixed prediction.`;
        break;
      default:
        responseContent = `Namaste ${name}. May peace and clarity guide your steps today. Reflect deeply and act with a compassionate heart.`;
    }

    // 4. Write assistant message
    await addDoc(messagesRef, {
      role: "assistant",
      content: responseContent,
      guideId,
      createdAt: serverTimestamp()
    });

    // Update session last message
    await setDoc(sessionRef, {
      id: chatId,
      uid,
      guideId,
      lastMessage: responseContent,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  /**
   * Subscribe to messages for a specific chat.
   */
  subscribeToMessages(uid: string, guideId: string, callback: (messages: ChatMessage[]) => void) {
    const chatId = `${uid}_${guideId}`;
    const messagesRef = collection(db, `users/${uid}/aiChats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      callback(msgs);
    });
  }
}

export const aiGuideService = new AiGuideService();
