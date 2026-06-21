import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { WelcomeScreen } from "../components/auth/WelcomeScreen";

export const AppEntry: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
      if (loading) return; // Wait for Firebase Auth to initialize

      if (!currentUser) {
        // Logged out: handled by rendering WelcomeScreen below
        return;
      }

      setIsCheckingProfile(true);
      try {
        const profile = await userService.getUserProfile(currentUser.uid);
        
        if (!isMounted) return;

        if (!profile || !profile.profileCompleted) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error checking user profile at entry", err);
        // On error, default to onboarding to be safe
        if (isMounted) {
          navigate("/onboarding", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false);
        }
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser, loading, navigate]);

  // Cosmic Splash Screen while determining auth state or fetching profile
  if (loading || (currentUser && isCheckingProfile)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="w-28 h-28 relative z-10 rounded-full overflow-hidden flex items-center justify-center border-[3px] border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse bg-white">
          <img 
            src="/logo-srichackra.png?v=locked" 
            alt="Divine Panchang" 
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <p className="mt-6 text-amber-500 font-medium tracking-widest uppercase text-sm animate-pulse z-10">
          Aligning Stars...
        </p>
      </div>
    );
  }

  // If not loading and no current user, show the Welcome Screen
  if (!currentUser) {
    return <WelcomeScreen />;
  }

  // Fallback (should theoretically never be reached due to redirects)
  return null;
};

export default AppEntry;
