import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { userService } from "./userService";

class AuthService {
  async register(email: string, password: string, name: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create initial user profile
    await userService.createUserProfile(user.uid, {
      email,
      displayName: name,
      provider: "email",
    });
    
    return user;
  }

  async login(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await userService.updateLastLogin(userCredential.user.uid);
    return userCredential.user;
  }

  async googleLogin(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if profile exists, if not create one, else update lastLogin
    const profile = await userService.getUserProfile(user.uid);
    if (!profile) {
      await userService.createUserProfile(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || null,
        provider: "google",
      });
    } else {
      await userService.updateLastLogin(user.uid);
    }
    
    return user;
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();
