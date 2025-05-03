import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { connectWallet, isWalletConnected, getWalletAddress, listenForAccountChange } from "@/services/web3Service";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Conectar la wallet
    const connectWalletHandler = async () => {
        try {
            const { account } = await connectWallet();
            setWalletAddress(account);
            setWalletConnected(true);
            localStorage.setItem("walletConnected", "true");
        } catch (error) {
            console.error("Error al conectar la wallet:", error);
        }
    };

    // Verificar si la wallet está conectada
    const checkIfWalletIsConnected = async () => {
        const connected = await isWalletConnected();
        if (connected && localStorage.getItem("walletConnected") === "true") {
            const address = await getWalletAddress();
            setWalletAddress(address);
            setWalletConnected(true);
        } else {
            localStorage.setItem("walletConnected", "false");
        }
    };

    // Escuchar cambios de cuenta
    useEffect(() => {
        checkIfWalletIsConnected();
        listenForAccountChange((newAddress) => {
            if (newAddress) {
                setWalletAddress(newAddress);
                setWalletConnected(true);
                localStorage.setItem("walletConnected", "true");
            } else {
                setWalletAddress(null);
                setWalletConnected(false);
                localStorage.setItem("walletConnected", "false");
            }
        });
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-eco-emerald/20">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-110">
                        <img src="/favicon.svg" alt="Zyrcle Logo" className="h-10 w-10" />
                        <span className="text-xl font-bold text-eco-forest">ZYRCLE</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-eco-forest hover:text-eco-emerald/80 font-medium px-3 py-2 rounded-md transition-colors">
                            Home
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-eco-forest hover:text-white font-medium px-3 py-2 rounded-md"
                                >
                                    Residents
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white rounded-xl shadow-sm border-eco-emerald/20">
                                <DropdownMenuLabel className="text-eco-forest">For Residents</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/residence" className="text-eco-forest hover:bg-eco-emerald/5">
                                        Residence
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/recycling" className="text-eco-forest hover:bg-eco-emerald/5">
                                        Recycling
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/marketplace" className="text-eco-forest hover:bg-eco-emerald/5">
                                        Marketplace
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-eco-forest hover:text-white font-medium px-3 py-2 rounded-md"
                                >
                                    Collectors
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white rounded-xl shadow-sm border-eco-emerald/20">
                                <DropdownMenuLabel className="text-eco-forest">For Collectors</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/collectors" className="text-eco-forest hover:bg-eco-emerald/5">
                                        Collectors
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-eco-forest hover:text-white font-medium px-3 py-2 rounded-md"
                                >
                                    Verifiers
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white rounded-xl shadow-sm border-eco-emerald/20">
                                <DropdownMenuLabel className="text-eco-forest">For Verifiers</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/verify" className="text-eco-forest hover:bg-eco-emerald/5">
                                        Verifier
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            onClick={connectWalletHandler}
                            className={cn(
                                "flex items-center gap-2 bg-eco-emerald text-white hover:bg-eco-emerald/90 hover:scale-105 transition-transform",
                                walletConnected ? "pl-2 pr-3" : "px-4"
                            )}
                        >
                            <Wallet className="h-4 w-4" />
                            {walletConnected && walletAddress
                                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                                : "Connect Wallet"}
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-3">
                        <Button
                            onClick={connectWalletHandler}
                            size="sm"
                            className="flex items-center bg-eco-emerald text-white hover:bg-eco-emerald/90"
                        >
                            <Wallet className="h-4 w-4 mr-1" />
                            {walletConnected && walletAddress
                                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                                : "Connect"}
                        </Button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-eco-forest"
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-eco-emerald">
                                {isMenuOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-3 pb-4">
                        <Accordion type="single" collapsible className="space-y-2">
                            <Link to="/" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                Home
                            </Link>
                            <AccordionItem value="residents">
                                <AccordionTrigger className="px-3 py-2 text-eco-forest hover:bg-eco-emerald/5">
                                    Residents
                                </AccordionTrigger>
                                <AccordionContent className="pl-6 space-y-2">
                                    <Link to="/residence" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                        Residence
                                    </Link>
                                    <Link to="/recycling" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                        Recycling
                                    </Link>
                                    <Link to="/marketplace" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                        Marketplace
                                    </Link>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="collectors">
                                <AccordionTrigger className="px-3 py-2 text-eco-forest hover:bg-eco-emerald/5">
                                    Collectors
                                </AccordionTrigger>
                                <AccordionContent className="pl-6">
                                    <Link to="/collectors" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                        Collectors
                                    </Link>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="verifiers">
                                <AccordionTrigger className="px-3 py-2 text-eco-forest hover:bg-eco-emerald/5">
                                    Verifiers
                                </AccordionTrigger>
                                <AccordionContent className="pl-6">
                                    <Link to="/verify" className="block px-3 py-2 rounded-md hover:bg-eco-emerald/5 text-eco-forest">
                                        Verifier
                                    </Link>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </div>
        </nav>
    );
}