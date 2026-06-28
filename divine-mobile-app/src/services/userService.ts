import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { UserProfile } from "../types/user";

class UserService {
  private collectionName = "users";

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  async getCurrentUserProfile(uid: string): Promise<UserProfile | null> {
    return this.getUserProfile(uid);
  }

  async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      const now = serverTimestamp();
      
      const defaultData: Partial<UserProfile> = {
        uid,
        provider: "email",
        role: "user",
        profileCompleted: false,
        subscription: "free",
        createdAt: now as Timestamp,
        updatedAt: now as Timestamp,
        lastLogin: now as Timestamp,
        ...data,
      };
      
      await setDoc(docRef, defaultData, { merge: true });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async getBirthDetails(uid: string): Promise<UserProfile["birthDetails"] | null> {
    try {
      const profile = await this.getUserProfile(uid);
      return profile?.birthDetails || null;
    } catch (error) {
      console.error("Error fetching birth details:", error);
      throw error;
    }
  }

  async updateBirthDetails(uid: string, data: Partial<NonNullable<UserProfile["birthDetails"]>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      await setDoc(docRef, {
        birthDetails: data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating birth details:", error);
      throw error;
    }
  }

  async completeOnboarding(uid: string, onboardingData: {
    profile: NonNullable<UserProfile["profile"]>;
    birthDetails: NonNullable<UserProfile["birthDetails"]>;
  }): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      await setDoc(docRef, {
        profileCompleted: true,
        profile: onboardingData.profile,
        birthDetails: onboardingData.birthDetails,
        preferences: {
          language: "en",
          theme: "system",
          notifications: true,
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  }

  async updateLastLogin(uid: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, uid);
      await updateDoc(docRef, {
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  async signOutUser(): Promise<void> {
    await signOut(auth);
  }
}

export const userService = new UserService();
