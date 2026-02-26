import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import QuizScreen from "./pages/QuizScreen";
import InsightScreen from "./pages/InsightScreen";
import SocialProofScreen from "./pages/SocialProofScreen";
import FeatureDistanceScreen from "./pages/FeatureDistanceScreen";
import FeatureLockScreen from "./pages/FeatureLockScreen";
import NameInputScreen from "./pages/NameInputScreen";
import PartnerNameScreen from "./pages/PartnerNameScreen";
import LoadingScreen from "./pages/LoadingScreen";
import ResultsScreen from "./pages/ResultsScreen";
import PaywallScreen from "./pages/PaywallScreen";
import HomeScreen from "./pages/HomeScreen";
import WeeklyReportScreen from "./pages/WeeklyReportScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-[430px] mx-auto min-h-[100dvh] relative">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/quiz" element={<QuizScreen />} />
            <Route path="/insight" element={<InsightScreen />} />
            <Route path="/social-proof" element={<SocialProofScreen />} />
            <Route path="/feature-distance" element={<FeatureDistanceScreen />} />
            <Route path="/feature-lock" element={<FeatureLockScreen />} />
            <Route path="/name" element={<NameInputScreen />} />
            <Route path="/partner-name" element={<PartnerNameScreen />} />
            <Route path="/loading" element={<LoadingScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/paywall" element={<PaywallScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/weekly" element={<WeeklyReportScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;