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
import { OmChantProvider } from "./components/om/OmChantProvider";

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
      <Route path="/" element={<Index />} />
      <Route path="/panchang" element={<PanchangPage />} />
      <Route path="/panchang-live" element={<PanchangLive />} />
      <Route path="/panchang/:citySlug" element={<PanchangCityPage />} />
      <Route path="/choghadiya" element={<ChoghadiyaPage />} />
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
      <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
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
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
