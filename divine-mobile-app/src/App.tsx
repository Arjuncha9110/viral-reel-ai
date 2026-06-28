import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { EmailPopup } from "./components/shared/EmailPopup";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import { Sun } from "lucide-react";
import { OmChantProvider } from "./components/om/OmChantProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./auth/Login";
import { Register } from "./auth/Register";
import { ForgotPassword } from "./auth/ForgotPassword";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";

// App routes
import Dashboard from "./pages/Dashboard";
import AppEntry from "./pages/AppEntry";
import AppPanchang from "./pages/app/AppPanchang";
import AppKundali from "./pages/app/AppKundali";
import AppTools from "./pages/app/AppTools";
import AppProfile from "./pages/app/AppProfile";
import AppPlaceholder from "./pages/app/AppPlaceholder";
import AppBirthNumerology from "./pages/app/AppBirthNumerology";
import AppNameNumerology from "./pages/app/AppNameNumerology";
import AppChoghadiya from "./pages/app/AppChoghadiya";
import AppMoonCycle from "./pages/app/AppMoonCycle";
import AppEkadashi from "./pages/app/AppEkadashi";
import AppDailyGuidance from "./pages/app/AppDailyGuidance";
import AppLiveDashboard from "./pages/app/AppLiveDashboard";
import AppKundaliReport from "./pages/app/AppKundaliReport";
import AppDasha from "./pages/app/AppDasha";
import AppSadeSati from "./pages/app/AppSadeSati";
import AppWeeklyZodiac from "./pages/app/AppWeeklyZodiac";
import AppEclipse from "./pages/app/AppEclipse";
import AppDivineMatch from "./pages/app/AppDivineMatch";
import AppVehicleNumber from "./pages/app/AppVehicleNumber";
import AppMuhurat from "./pages/app/AppMuhurat";
import AppFestivals from "./pages/app/AppFestivals";
import AppNadiShodhana from "./pages/app/AppNadiShodhana";
import AppAstroGuides from "./pages/app/AppAstroGuides";
import AppAstroChat from "./pages/app/AppAstroChat";
import AppJoinAstrologer from "./pages/app/AppJoinAstrologer";
import AppVastuCompass from "./pages/app/AppVastuCompass";
import AppVastuDirection from "./pages/app/AppVastuDirection";
import AppPalmistry from "./pages/app/AppPalmistry";
import AppPalmistryDetail from "./pages/app/AppPalmistryDetail";
import AppBreathing from "./pages/app/AppBreathing";
import AppBreathingSession from "./pages/app/AppBreathingSession";
import AppChineseHoroscope from "./pages/app/AppChineseHoroscope";
import AppChineseHoroscopeDetail from "./pages/app/AppChineseHoroscopeDetail";
import KundaliReportPreview from "./pages/KundaliReportPreview";
import SadeSatiReportPreview from "./pages/SadeSatiReportPreview";

const queryClient = new QueryClient();

export const AppContent = () => (
  <OmChantProvider>
    <ScrollToTop />
    <EmailPopup />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
      
      {/* Mobile App Routes */}
      <Route path="/" element={<AppEntry />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/panchang" element={<ProtectedRoute><AppPanchang /></ProtectedRoute>} />
      <Route path="/kundali" element={<ProtectedRoute><AppKundali /></ProtectedRoute>} />
      <Route path="/kundali-report" element={<ProtectedRoute><AppKundaliReport /></ProtectedRoute>} />
      <Route path="/app/kundali-report" element={<Navigate to="/kundali-report" replace />} />
      <Route path="/tools" element={<ProtectedRoute><AppTools /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppProfile /></ProtectedRoute>} />
      
      <Route path="/sade-sati" element={<ProtectedRoute><AppSadeSati /></ProtectedRoute>} />
      <Route path="/live-dashboard" element={<ProtectedRoute><AppLiveDashboard /></ProtectedRoute>} />
      <Route path="/daily-guidance" element={<ProtectedRoute><AppDailyGuidance /></ProtectedRoute>} />
      <Route path="/choghadiya" element={<ProtectedRoute><AppChoghadiya /></ProtectedRoute>} />
      <Route path="/weekly-zodiac" element={<ProtectedRoute><AppWeeklyZodiac /></ProtectedRoute>} />
      <Route path="/ekadashi" element={<ProtectedRoute><AppEkadashi /></ProtectedRoute>} />
      <Route path="/dasha" element={<ProtectedRoute><AppDasha /></ProtectedRoute>} />
      <Route path="/name-numerology" element={<ProtectedRoute><AppNameNumerology /></ProtectedRoute>} />
      <Route path="/vehicle-number" element={<ProtectedRoute><AppVehicleNumber /></ProtectedRoute>} />
      <Route path="/birth-numerology" element={<ProtectedRoute><AppBirthNumerology /></ProtectedRoute>} />
      <Route path="/eclipse" element={<ProtectedRoute><AppEclipse /></ProtectedRoute>} />
      <Route path="/match" element={<ProtectedRoute><AppDivineMatch /></ProtectedRoute>} />
      <Route path="/moon-cycle" element={<ProtectedRoute><AppMoonCycle /></ProtectedRoute>} />
      <Route path="/muhurat" element={<ProtectedRoute><AppMuhurat /></ProtectedRoute>} />
      <Route path="/festivals" element={<ProtectedRoute><AppFestivals /></ProtectedRoute>} />
      <Route path="/horoscope" element={<ProtectedRoute><AppPlaceholder title="Daily Horoscope" description="Receive daily Vedic guidance based on your saved birth profile." icon={Sun} theme="amber" /></ProtectedRoute>} />
      <Route path="/astro-guides" element={<ProtectedRoute><AppAstroGuides /></ProtectedRoute>} />
      <Route path="/astro-guides/:guideId/chat" element={<ProtectedRoute><AppAstroChat /></ProtectedRoute>} />
      <Route path="/join-astrologer" element={<ProtectedRoute><AppJoinAstrologer /></ProtectedRoute>} />
      <Route path="/vastu" element={<ProtectedRoute><AppVastuCompass /></ProtectedRoute>} />
      <Route path="/vastu/:direction" element={<ProtectedRoute><AppVastuDirection /></ProtectedRoute>} />
      <Route path="/palmistry" element={<ProtectedRoute><AppPalmistry /></ProtectedRoute>} />
      <Route path="/palmistry/:slug" element={<ProtectedRoute><AppPalmistryDetail /></ProtectedRoute>} />
      <Route path="/breathing" element={<ProtectedRoute><AppBreathing /></ProtectedRoute>} />
      <Route path="/breathing/:routineSlug" element={<ProtectedRoute><AppBreathingSession /></ProtectedRoute>} />
      <Route path="/nadi-shodhana" element={<Navigate to="/breathing/nadi-shodhana" replace />} />

      {/* Chinese Horoscope 2026 Routes */}
      <Route path="/chinese-horoscope" element={<ProtectedRoute><AppChineseHoroscope /></ProtectedRoute>} />
      <Route path="/chinese-horoscope/:signSlug" element={<ProtectedRoute><AppChineseHoroscopeDetail /></ProtectedRoute>} />
      <Route path="/chinese-astrology" element={<Navigate to="/chinese-horoscope" replace />} />
      <Route path="/chinese-horoscope-2026" element={<Navigate to="/chinese-horoscope" replace />} />

      {/* Legacy /app links from older mobile builds */}
      <Route path="/app/kundali" element={<Navigate to="/kundali" replace />} />
      <Route path="/app/daily-guidance" element={<Navigate to="/daily-guidance" replace />} />
      <Route path="/app/choghadiya" element={<Navigate to="/choghadiya" replace />} />
      <Route path="/app/moon-cycle" element={<Navigate to="/moon-cycle" replace />} />
      <Route path="/app/sade-sati" element={<Navigate to="/sade-sati" replace />} />
      <Route path="/app/weekly-zodiac" element={<Navigate to="/weekly-zodiac" replace />} />
      <Route path="/app/eclipse" element={<Navigate to="/eclipse" replace />} />
      <Route path="/app/match" element={<Navigate to="/match" replace />} />
      <Route path="/app/ekadashi" element={<Navigate to="/ekadashi" replace />} />
      <Route path="/app/nadi-shodhana" element={<Navigate to="/nadi-shodhana" replace />} />

      {/* Report Previews */}
      <Route path="/kundali-report-preview" element={<KundaliReportPreview />} />
      <Route path="/sade-sati-report-preview" element={<SadeSatiReportPreview />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </OmChantProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
