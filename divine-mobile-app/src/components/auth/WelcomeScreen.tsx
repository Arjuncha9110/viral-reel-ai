import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Globe } from "lucide-react";

export const WelcomeScreen: React.FC = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authService.googleLogin();
      // On success, AppEntry will automatically re-evaluate currentUser state
      // and redirect to onboarding or dashboard as needed.
    } catch (err: unknown) {
      console.error("Google Auth failed", err);
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-body relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Cosmic Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-900 to-slate-900 z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-28 h-28 mb-6 relative rounded-full overflow-hidden flex items-center justify-center border-[3px] border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-white">
            <img 
              src="/logo-srichakra.png?v=locked" 
              alt="Divine Panchang Logo" 
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <h1 className="text-4xl font-display font-bold text-white text-center mb-2 tracking-tight">
            Divine Panchang
          </h1>
          <p className="text-amber-400 font-medium text-lg text-center">
            Your Personal Spiritual Companion
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-14 bg-white text-slate-800 font-semibold rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-3" />
                Continue with Google
              </>
            )}
          </button>

          <Link
            to="/register"
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-2xl flex items-center justify-center shadow-glow-gold hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <Mail className="w-5 h-5 mr-2" />
            Sign up with Email
          </Link>

          <div className="pt-6 border-t border-slate-700/50 mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-400 font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/web" className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-semibold flex items-center justify-center">
            <Globe className="w-4 h-4 mr-1" />
            Visit Website
          </Link>
        </div>
      </div>
    </div>
  );
};
