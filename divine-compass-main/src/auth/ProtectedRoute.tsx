import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      userService.getUserProfile(currentUser.uid)
        .then(profile => {
          if (isMounted) {
            setProfileCompleted(profile?.profileCompleted ?? false);
            setProfileLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setProfileCompleted(false);
            setProfileLoading(false);
          }
        });
    } else if (!authLoading) {
      setProfileLoading(false);
    }
    return () => { isMounted = false; };
  }, [currentUser, authLoading]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Prevent routing loops if they are already on onboarding
  if (!profileCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
