import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import PanchangPage from "./pages/PanchangPage";
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
import DailyGuidancePage from "./pages/DailyGuidancePage";
import JanamKundliPage from "./pages/JanamKundliPage";
import EclipsePage from "./pages/EclipsePage";
import MatchPage from "./pages/MatchPage";
import NadiShodhanaPage from "./pages/NadiShodhanaPage";
import MoonCyclePage from "./pages/MoonCyclePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import { OmChantProvider } from "./components/om/OmChantProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OmChantProvider>
          <ScrollToTop />
          <EmailPopup />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/panchang" element={<PanchangPage />} />
            <Route path="/panchang-live" element={<PanchangLive />} />
            <Route path="/panchang/new-delhi" element={<Navigate to="/panchang" replace />} />
            <Route path="/ekadashi" element={<EkadashiPage />} />
            <Route path="/weekly-zodiac" element={<WeeklyZodiacPage />} />
            <Route path="/numerology/name" element={<NameNumerologyPage />} />
            <Route path="/numerology/birth" element={<BirthNumerologyPage />} />
            <Route path="/daily-guidance" element={<DailyGuidancePage />} />
            <Route path="/janam-kundli" element={<JanamKundliPage />} />
            <Route path="/eclipse" element={<EclipsePage />} />
            <Route path="/dasha" element={<DashaPage />} />
            <Route path="/sade-sati" element={<SadeSatiPage />} />
            <Route path="/kundali" element={<KundaliPage />} />
            <Route path="/kundali-report" element={<KundaliReportPage />} />
            <Route path="/kundali-report-preview" element={<KundaliReportPreview />} />
            <Route path="/sade-sati-report-preview" element={<SadeSatiReportPreview />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/nadi-shodhana" element={<NadiShodhanaPage />} />
            <Route path="/moon-cycle" element={<MoonCyclePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OmChantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
