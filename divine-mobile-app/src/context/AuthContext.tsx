import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { authService } from "../services/authService";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  login: typeof authService.login;
  logout: typeof authService.logout;
  register: typeof authService.register;
  googleLogin: typeof authService.googleLogin;
  forgotPassword: typeof authService.forgotPassword;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      setCurrentUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login: authService.login,
        logout: authService.logout,
        register: authService.register,
        googleLogin: authService.googleLogin,
        forgotPassword: authService.forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
