import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import RequireAuth from "./components/auth/RequireAuth";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import ActivityPage from "./pages/ActivityPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductPage from "./pages/AddProductPage";
import ScanPage from "./pages/ScanPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    import("./lib/firebase").then(() => {
      console.log("Firebase initialized");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
                <Route path="/inventory" element={<RequireAuth><InventoryPage /></RequireAuth>} />
                <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                <Route path="/activity" element={<RequireAuth><ActivityPage /></RequireAuth>} />
                <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                <Route path="/add-product" element={<RequireAuth><AddProductPage /></RequireAuth>} />
                <Route path="/scan" element={<RequireAuth><ScanPage /></RequireAuth>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
