import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface AstrologerApplication {
  fullName: string;
  whatsapp: string;
  email: string;
  city: string;
  languages: string[];
  specialties: string[];
  experienceYears: number;
  chatRatePerMin: number;
  callRatePerMin: number;
  bio: string;
  status: "pending" | "approved" | "rejected";
}

class AstrologerApplicationService {
  async submitApplication(data: Omit<AstrologerApplication, "status">): Promise<string> {
    try {
      const applicationsRef = collection(db, "astrologerApplications");
      const docRef = await addDoc(applicationsRef, {
        ...data,
        status: "pending",
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error submitting astrologer application:", error);
      throw error;
    }
  }
}

export const astrologerApplicationService = new AstrologerApplicationService();
