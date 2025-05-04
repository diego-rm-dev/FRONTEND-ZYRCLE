import { useState, useEffect } from "react";
import { toast, Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { connectWallet, isWalletConnected } from "@/services/web3Service";
import Index from "./pages/Index";
import Residence from "./pages/Residence";
import Collectors from "./pages/Collectors";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";
import RecyclingAccessPage from "./pages/RecyclingPage";
import EventHistoryPage from "./pages/EventHistory";
import { ContainerVerification } from "./components/collectors/ContainerVerification";
import MyCertificates from "./pages/MyCertificates";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isWalletConnected();
      const remembered = localStorage.getItem("walletConnected") === "true";
      if (!connected || !remembered) {
        setWalletConnected(false);
        setIsWalletModalOpen(true);
      } else {
        setWalletConnected(true);
        setIsWalletModalOpen(false);
      }
    };

    checkConnection();
  }, [location.pathname]);

  const handleConnect = async () => {
    try {
      const { account } = await connectWallet();
      localStorage.setItem("walletConnected", "true");
      sessionStorage.setItem("walletAddress", account);
      setWalletConnected(true);
      setIsWalletModalOpen(false);
      toast.success("Wallet Connected", {
        description: "You are now connected to your wallet.",
      });
    } catch (err) {
      toast.error("Failed to connect wallet", {
        description: "Please try again.",
      });
    }
  };

  return (
    <>
      {children}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-eco-forest flex items-center">
              <Wallet className="h-6 w-6 mr-2 text-eco-emerald" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-eco-forest/70">
              Please connect your wallet to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full bg-eco-emerald text-white hover:bg-eco-emerald/90"
              onClick={handleConnect}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/residence"
            element={
              <ProtectedRoute>
                <Residence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collectors"
            element={
              <ProtectedRoute>
                <Collectors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycling"
            element={
              <ProtectedRoute>
                <RecyclingAccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validator"
            element={
              <ProtectedRoute>
                <EventHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          <Route path="/my-certificates" element={<MyCertificates />} />
          <Route path="/verify-container/:containerId" element={<ContainerVerification />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;