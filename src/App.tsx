import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index.tsx";
import SantriPage from "./pages/SantriPage";
import UstadzPage from "./pages/UstadzPage";
import SetoranPage from "./pages/SetoranPage";
import LaporanPage from "./pages/LaporanPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/santri" element={<SantriPage />} />
              <Route path="/ustadz" element={<UstadzPage />} />
              <Route path="/setoran" element={<SetoranPage />} />
              <Route path="/laporan" element={<LaporanPage />} />
              <Route path="/pengaturan" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
