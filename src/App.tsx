import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useKeyboardScroll } from "@/hooks/useKeyboardScroll";
import { SilentAuthGate } from "@/components/SilentAuthGate";
import EntryRoute from "./pages/EntryRoute";
import QuizScreen from "./pages/QuizScreen";
import InsightScreen from "./pages/InsightScreen";
import SocialProofScreen from "./pages/SocialProofScreen";
import FeatureDistanceScreen from "./pages/FeatureDistanceScreen";
import FeatureLockScreen from "./pages/FeatureLockScreen";
import NameInputScreen from "./pages/NameInputScreen";
import PartnerNameScreen from "./pages/PartnerNameScreen";
import AnniversaryScreen from "./pages/AnniversaryScreen";
import LoadingScreen from "./pages/LoadingScreen";
import ResultsScreen from "./pages/ResultsScreen";
import PaywallScreen from "./pages/PaywallScreen";
import HomeScreen from "./pages/HomeScreen";
import WeeklyReportScreen from "./pages/WeeklyReportScreen";
import ConnectPartnerScreen from "./pages/ConnectPartnerScreen";
import NotificationScreen from "./pages/NotificationScreen";
import MoodScreen from "./pages/MoodScreen";
import SettingsScreen from "./pages/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const KeyboardHandler = () => {
  useKeyboardScroll();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KeyboardHandler />
        <div className="max-w-[430px] mx-auto min-h-[100dvh] relative overflow-x-hidden">
          <Routes>
            <Route path="/" element={<EntryRoute />} />
            {/* Public onboarding screens — no auth required */}
            <Route path="/quiz" element={<QuizScreen />} />
            <Route path="/insight" element={<InsightScreen />} />
            <Route path="/social-proof" element={<SocialProofScreen />} />
            <Route path="/feature-distance" element={<FeatureDistanceScreen />} />
            <Route path="/feature-lock" element={<FeatureLockScreen />} />
            <Route path="/loading" element={<LoadingScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            {/* Protected screens — silent device auth */}
            <Route path="/name" element={<SilentAuthGate><NameInputScreen /></SilentAuthGate>} />
            <Route path="/partner-name" element={<SilentAuthGate><PartnerNameScreen /></SilentAuthGate>} />
            <Route path="/anniversary" element={<SilentAuthGate><AnniversaryScreen /></SilentAuthGate>} />
            <Route path="/paywall" element={<SilentAuthGate><PaywallScreen /></SilentAuthGate>} />
            <Route path="/connect" element={<SilentAuthGate><ConnectPartnerScreen /></SilentAuthGate>} />
            <Route path="/notification" element={<SilentAuthGate><NotificationScreen /></SilentAuthGate>} />
            <Route path="/home" element={<SilentAuthGate><HomeScreen /></SilentAuthGate>} />
            <Route path="/mood" element={<SilentAuthGate><MoodScreen /></SilentAuthGate>} />
            <Route path="/settings" element={<SilentAuthGate><SettingsScreen /></SilentAuthGate>} />
            <Route path="/weekly" element={<SilentAuthGate><WeeklyReportScreen /></SilentAuthGate>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
