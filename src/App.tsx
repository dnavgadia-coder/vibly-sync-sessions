import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SplashScreen from "./pages/SplashScreen";
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
import AuthScreen from "./pages/AuthScreen";
import ConnectPartnerScreen from "./pages/ConnectPartnerScreen";
import NotificationScreen from "./pages/NotificationScreen";
import MoodScreen from "./pages/MoodScreen";
import SettingsScreen from "./pages/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-[430px] mx-auto min-h-[100dvh] relative">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/quiz" element={<QuizScreen />} />
            <Route path="/insight" element={<InsightScreen />} />
            <Route path="/social-proof" element={<SocialProofScreen />} />
            <Route path="/feature-distance" element={<FeatureDistanceScreen />} />
            <Route path="/feature-lock" element={<FeatureLockScreen />} />
            <Route path="/name" element={<ProtectedRoute><NameInputScreen /></ProtectedRoute>} />
            <Route path="/partner-name" element={<ProtectedRoute><PartnerNameScreen /></ProtectedRoute>} />
            <Route path="/anniversary" element={<ProtectedRoute><AnniversaryScreen /></ProtectedRoute>} />
            <Route path="/loading" element={<ProtectedRoute><LoadingScreen /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsScreen /></ProtectedRoute>} />
            <Route path="/paywall" element={<ProtectedRoute><PaywallScreen /></ProtectedRoute>} />
            <Route path="/connect" element={<ProtectedRoute><ConnectPartnerScreen /></ProtectedRoute>} />
            <Route path="/notification" element={<ProtectedRoute><NotificationScreen /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MoodScreen /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
            <Route path="/weekly" element={<ProtectedRoute><WeeklyReportScreen /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
