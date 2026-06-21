import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import PanchangPage from "./pages/PanchangPage";
import PanchangCityPage from "./pages/PanchangCityPage";
import NameNumerologyPage from "./pages/NameNumerologyPage";
import BirthNumerologyPage from "./pages/BirthNumerologyPage";
import DashaPage from "./pages/DashaPage";
import SadeSatiPage from "./pages/SadeSatiPage";
import KundaliPage from "./pages/kundali/index";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import { EmailPopup } from "./components/shared/EmailPopup";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import EkadashiPage from "./pages/EkadashiPage";
import WeeklyZodiacPage from "./pages/WeeklyZodiacPage";
import KundaliReportPage from "./pages/KundaliReportPage";
import KundaliReportPreview from "./pages/KundaliReportPreview";
import SadeSatiReportPreview from "./pages/SadeSatiReportPreview";
import PanchangLive from "./pages/PanchangLive";
import ChoghadiyaPage from "./pages/ChoghadiyaPage";
import DailyGuidancePage from "./pages/DailyGuidancePage";
import JanamKundliPage from "./pages/JanamKundliPage";
import EclipsePage from "./pages/EclipsePage";
import MatchPage from "./pages/MatchPage";
import NadiShodhanaPage from "./pages/NadiShodhanaPage";
import MoonCyclePage from "./pages/MoonCyclePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import WhatIsPanchang from "./pages/blog/WhatIsPanchang";
import SadeSatiGuide from "./pages/blog/SadeSatiGuide";
import HowToReadKundali from "./pages/blog/HowToReadKundali";
import {
  Sun, Clock, MoonStar, Star, Eclipse, Heart,
  Hash, Sparkles, CalendarDays, Wind,
} from "lucide-react";
import { OmChantProvider } from "./components/om/OmChantProvider";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./auth/Login";
import { Register } from "./auth/Register";
import { ForgotPassword } from "./auth/ForgotPassword";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
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
import AppVastuCompass from "./pages/app/AppVastuCompass";
import AppVastuDirection from "./pages/app/AppVastuDirection";
import AppBreathing from "./pages/app/AppBreathing";
import AppBreathingSession from "./pages/app/AppBreathingSession";
import AppPalmistry from "./pages/app/AppPalmistry";
import AppPalmistryDetail from "./pages/app/AppPalmistryDetail";
import DivineAiGuruPage from "./pages/DivineAiGuruPage";

const queryClient = new QueryClient();

/**
 * Router-independent app tree. The client wraps this in BrowserRouter (below);
 * the prerender entry (src/entry-server.tsx) wraps it in StaticRouter so every
 * public route can be rendered to static HTML at build time.
 */
export const AppContent = () => (
  <OmChantProvider>
    <ScrollToTop />
    <EmailPopup />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/" element={<Index />} />
      <Route path="/web" element={<Navigate to="/" replace />} />
      <Route path="/app-entry" element={<AppEntry />} />
      {/* Public Pages */}
      <Route path="/panchang" element={<PanchangPage />} />
      <Route path="/sade-sati" element={<SadeSatiPage />} />
      <Route path="/choghadiya" element={<ChoghadiyaPage />} />
      <Route path="/daily-guidance" element={<DailyGuidancePage />} />
      <Route path="/weekly-zodiac" element={<WeeklyZodiacPage />} />
      <Route path="/ekadashi" element={<EkadashiPage />} />
      <Route path="/eclipse" element={<EclipsePage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/nadi-shodhana" element={<NadiShodhanaPage />} />
      <Route path="/moon-cycle" element={<MoonCyclePage />} />
      <Route path="/dasha-timeline" element={<DashaPage />} />
      <Route path="/web/kundali" element={<KundaliPage />} />

      {/* App Pages */}
      <Route path="/app/panchang" element={<ProtectedRoute><AppPanchang /></ProtectedRoute>} />
      <Route path="/kundali" element={<ProtectedRoute><AppKundali /></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><AppTools /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppProfile /></ProtectedRoute>} />
      <Route path="/app/sade-sati" element={<ProtectedRoute><AppSadeSati /></ProtectedRoute>} />
      <Route path="/live-dashboard" element={<ProtectedRoute><AppLiveDashboard /></ProtectedRoute>} />
      <Route path="/app/daily-guidance" element={<ProtectedRoute><AppDailyGuidance /></ProtectedRoute>} />
      <Route path="/app/choghadiya" element={<ProtectedRoute><AppChoghadiya /></ProtectedRoute>} />
      <Route path="/app/weekly-zodiac" element={<ProtectedRoute><AppWeeklyZodiac /></ProtectedRoute>} />
      <Route path="/app/ekadashi" element={<ProtectedRoute><AppEkadashi /></ProtectedRoute>} />
      <Route path="/dasha" element={<ProtectedRoute><AppDasha /></ProtectedRoute>} />
      <Route path="/name-numerology" element={<ProtectedRoute><AppNameNumerology /></ProtectedRoute>} />
      <Route path="/vehicle-number" element={<ProtectedRoute><AppVehicleNumber /></ProtectedRoute>} />
      <Route path="/birth-numerology" element={<ProtectedRoute><AppBirthNumerology /></ProtectedRoute>} />
      <Route path="/app/eclipse" element={<ProtectedRoute><AppEclipse /></ProtectedRoute>} />
      <Route path="/app/match" element={<ProtectedRoute><AppDivineMatch /></ProtectedRoute>} />
      <Route path="/app/nadi-shodhana" element={<ProtectedRoute><AppNadiShodhana /></ProtectedRoute>} />
      <Route path="/app/moon-cycle" element={<ProtectedRoute><AppMoonCycle /></ProtectedRoute>} />
      <Route path="/vastu" element={<ProtectedRoute><AppVastuCompass /></ProtectedRoute>} />
      <Route path="/vastu/:direction" element={<ProtectedRoute><AppVastuDirection /></ProtectedRoute>} />
      <Route path="/breathing" element={<ProtectedRoute><AppBreathing /></ProtectedRoute>} />
      <Route path="/breathing/:routineSlug" element={<ProtectedRoute><AppBreathingSession /></ProtectedRoute>} />
      <Route path="/palmistry" element={<ProtectedRoute><AppPalmistry /></ProtectedRoute>} />
      <Route path="/palmistry/:category" element={<ProtectedRoute><AppPalmistryDetail /></ProtectedRoute>} />
      <Route path="/muhurat" element={<ProtectedRoute><AppMuhurat /></ProtectedRoute>} />
      <Route path="/festivals" element={<ProtectedRoute><AppFestivals /></ProtectedRoute>} />
      <Route path="/horoscope" element={<ProtectedRoute><AppPlaceholder title="Daily Horoscope" description="Receive daily Vedic guidance based on your saved birth profile." icon={Sun} theme="amber" /></ProtectedRoute>} />
      <Route path="/chinese-horoscope" element={<Navigate to="/horoscope" replace />} />
      <Route path="/panchang-live" element={<PanchangLive />} />
      <Route path="/panchang/:citySlug" element={<PanchangCityPage />} />
      <Route path="/numerology/name" element={<NameNumerologyPage />} />
      <Route path="/numerology/birth" element={<BirthNumerologyPage />} />
      <Route path="/janam-kundli" element={<JanamKundliPage />} />
      <Route path="/app/kundali-report" element={<ProtectedRoute><AppKundaliReport /></ProtectedRoute>} />
      <Route path="/kundali-report" element={<KundaliReportPage />} />
      <Route path="/kundali-report-preview" element={<KundaliReportPreview />} />
      <Route path="/sade-sati-report-preview" element={<SadeSatiReportPreview />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/divine-ai" element={<DivineAiGuruPage />} />
      <Route path="/blog/what-is-panchang" element={<WhatIsPanchang />} />
      <Route path="/blog/sade-sati-guide" element={<SadeSatiGuide />} />
      <Route path="/blog/how-to-read-kundali" element={<HowToReadKundali />} />
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
