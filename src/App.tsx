
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import RequireAuth from "./components/auth/RequireAuth";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ActivityPage from "./pages/ActivityPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductPage from "./pages/AddProductPage";
import ScanPage from "./pages/ScanPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/ReportsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        await import("./lib/firebase");
        console.log("Firebase initialized in App");
        setFirebaseReady(true);
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        // Show some error state if Firebase fails to initialize
      }
    };
    
    initFirebase();
  }, []);

  if (!firebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading application...</span>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  
                  <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                  <Route path="/products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
                  <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                  <Route path="/activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />
                  <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
                  <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                  <Route path="/add-product" element={<RequireAuth><AddProductPage /></RequireAuth>} />
                  <Route path="/scan" element={<RequireAuth><ScanPage /></RequireAuth>} />
                  <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
