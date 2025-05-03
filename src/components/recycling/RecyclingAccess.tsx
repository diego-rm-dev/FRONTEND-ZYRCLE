import { useState, useEffect } from "react";
import { QrCode, CheckCircle, XCircle, Recycle, Check, Edit, MapPin, CircleDollarSign } from "lucide-react";
import { connectWallet, depositWaste } from "@/services/web3Service";
import { QrReader } from "react-qr-reader";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interfaces for API responses
interface ValidationResponse {
    message: string;
}

interface FinalizeResponse {
    message: string;
}

// Define type for QR scan result
interface QrScanResult {
    text: string;
}

// Mock container data for details display
const mockContainerData = [
    {
        id: 1,
        code: "123456",
        type: "Plastic",
        status: "Active",
        material: "PET",
        location: "Building A",
    },
    {
        id: 2,
        code: "654321",
        type: "Paper",
        status: "Active",
        material: "Mixed Paper",
        location: "Building A",
    },
    {
        id: 3,
        code: "111111",
        type: "Glass",
        status: "Active",
        material: "Mixed Glass",
        location: "Building B",
    },
    {
        id: 4,
        code: "999999",
        type: "Metal",
        status: "Maintenance",
        material: "Aluminum",
        location: "Building B",
    },
];

export function RecyclingAccess() {
    const [qrCode, setQrCode] = useState<string>("");
    const [manualCode, setManualCode] = useState<string>("");
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [validationMessage, setValidationMessage] = useState<string>("");
    const [connectedContainer, setConnectedContainer] = useState(null);
    const { toast } = useToast();
    // Mock static Zir balance (to be replaced with dynamic wallet balance)
    const zirBalance = 125.7;

    // Handle QR code scan
    const handleScan = (data: QrScanResult | null) => {
        if (data?.text) {
            const code = data.text;
            if (/^\d{6}$/.test(code)) {
                setQrCode(code);
                validateCode(code);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid QR Code",
                    description: "The QR code must contain a 6-digit number.",
                });
            }
        }
    };

    // Handle QR scan error
    const handleError = (err: Error) => {
        if (err.message.includes("Permission denied")) {
            setError("Camera access denied. Please allow camera access or enter the code manually.");
            setIsScanning(false);
        } else {
            setError("Error accessing camera. Please try manual input.");
            setIsScanning(false);
        }
    };

    // Validate code via API
    const validateCode = async (code: string) => {
        try {
            const response = await fetch("https://zyrcle-backend.diegormdev.site/api/contenedor/validar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: code }),
            });
            const data: ValidationResponse = await response.json();

            if (response.ok) {
                setValidationMessage(data.message || "Access granted!");
                setStartTime(Date.now());
                setError(null);
                const container = mockContainerData.find((c) => c.code === code);
                setConnectedContainer(container || null);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid Code",
                    description: data.message || "The code is not valid.",
                });
            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to validate code. Please try again.",
            });
        }
    };

    // Handle manual code submission
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (/^\d{6}$/.test(manualCode)) {
            validateCode(manualCode);
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Input",
                description: "Please enter a 6-digit code.",
            });
        }
    };

    // Handle finishing the recycling process
    const handleFinish = async () => {
        if (!startTime) return;

        const endTime = Date.now();
        const timeSpent = (endTime - startTime) / 1000; // Tiempo en segundos

        try {
            const response = await fetch("https://zyrcle-backend.diegormdev.site/api/contenedor/finalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigo: qrCode || manualCode,
                    tiempoTranscurrido: timeSpent,
                }),
            });

            const data: FinalizeResponse = await response.json();
            console.log("Respuesta backend:", data.message);

            if (response.ok) {
                toast({
                    title: "Success",
                    description: data.message || "Recycling recorded successfully! Thank you!",
                });

                // 🧠 Extraer peso en kg del mensaje
                const weightMatch = data.message.match(/Reciclaje añadido:\s*(\d+(?:\.\d+)?)\s*kg/);
                const weightInKg = weightMatch ? parseFloat(weightMatch[1]) : 0;
                console.log("Peso extraído del mensaje:", weightInKg, "kg");

                if (weightInKg > 0) {
                    // Conectar wallet y llamar contrato
                    const { account, zyrcleCore } = await connectWallet();
                    const tx = await depositWaste(zyrcleCore, account, weightInKg);
                    console.log("Tx confirmada:", tx.transactionHash);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to record recycling.",
                });
            }
        } catch (err) {
            console.error("Error general:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to complete the process. Please try again.",
            });
        }

        setQrCode("");
        setManualCode("");
        setIsScanning(true);
        setConnectedContainer(null);
        setValidationMessage("");
        setStartTime(null);
    };

    return (
        <TooltipProvider>
            <div className="space-y-8 p-4 max-w-4xl mx-auto bg-gradient-to-b from-eco-lime/5 to-eco-emerald/5 min-h-screen">
                {/* Tarjeta de balance de Zir */}
                <Card className="fixed top-4 right-4 max-w-xs shadow-sm border-0 rounded-xl bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-eco-forest flex items-center">
                            <CircleDollarSign className="h-4 w-4 mr-2 text-eco-emerald" />
                            Zir Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold text-eco-emerald">
                            {zirBalance.toFixed(1)} ZIR
                        </div>
                        {/* Para balance dinámico, usa:
                const [zirBalance, setZirBalance] = useState(0);
                useEffect(() => {
                  async function fetchBalance() {
                    const { account } = await connectWallet();
                    const balance = await getZirBalance(account); // Implementar en web3Service
                    setZirBalance(balance);
                  }
                  fetchBalance();
                }, []);
                Luego reemplaza {zirBalance.toFixed(1)} ZIR
            */}
                    </CardContent>
                </Card>

                {/* Encabezado principal */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-eco-forest flex items-center justify-center">
                        <Recycle className="h-8 w-8 mr-2 text-eco-emerald" />
                        Smart Recycling Access
                    </h1>
                    <p className="text-eco-forest/70 mt-2">
                        {connectedContainer
                            ? `You're recycling with the ${connectedContainer.type} container!`
                            : "Scan or enter a code to start recycling"}
                    </p>
                </div>

                {/* Tarjeta principal */}
                <Card className="shadow-sm border-0 rounded-xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl text-eco-forest">
                            Access a Recycling Container
                        </CardTitle>
                        <CardDescription className="text-eco-forest/70">
                            Use the QR scanner or enter the 6-digit code to unlock the container.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 transition-all duration-300">
                        {connectedContainer ? (
                            <div className="text-center space-y-6 animate-fade-in">
                                <Recycle className="h-16 w-16 mx-auto text-eco-emerald" />
                                <p className="text-lg font-semibold text-eco-forest">
                                    Deposit your recyclables in the {connectedContainer.type} container
                                </p>
                                <p className="text-sm text-eco-forest/70">{validationMessage}</p>
                                <p className="text-sm text-eco-forest/60">
                                    You're helping the planet! Earn Zir tokens for your efforts.
                                </p>
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleFinish}
                                            className="w-full bg-eco-emerald text-white hover:bg-eco-emerald/90 hover:scale-105 transition-transform duration-200"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Finish Recycling
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Complete the recycling process
                                    </TooltipContent>
                                </UITooltip>
                            </div>
                        ) : isScanning ? (
                            <div className="space-y-4">
                                <div className="relative aspect-square max-w-md mx-auto">
                                    <QrReader
                                        onResult={handleScan}
                                        onError={handleError}
                                        constraints={{ facingMode: "environment" }}
                                        className="w-full rounded-lg overflow-hidden"
                                    />
                                    <div className="absolute inset-0 border-4 border-eco-emerald/50 rounded-lg pointer-events-none animate-pulse" />
                                    <p className="text-center text-sm text-eco-forest/70 mt-2">
                                        Point your camera at the container's QR code
                                    </p>
                                </div>
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full text-eco-forest hover:bg-eco-forest/10"
                                            onClick={() => setIsScanning(false)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Enter Code Manually
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Switch to manual code entry
                                    </TooltipContent>
                                </UITooltip>
                            </div>
                        ) : (
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={manualCode}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setManualCode(e.target.value)
                                        }
                                        maxLength={6}
                                        className={`text-center text-lg ${error ? "border-red-500" : ""
                                            }`}
                                    />
                                    {error && (
                                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg mt-2">
                                            {error}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-eco-emerald text-white hover:bg-eco-emerald/90"
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Submit Code
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Validate the entered code
                                        </TooltipContent>
                                    </UITooltip>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-eco-forest hover:bg-eco-forest/10"
                                                onClick={() => {
                                                    setIsScanning(true);
                                                    setError(null);
                                                    setManualCode("");
                                                }}
                                            >
                                                <QrCode className="h-4 w-4 mr-2" />
                                                Scan QR Code
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Switch to QR code scanner
                                        </TooltipContent>
                                    </UITooltip>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Detalles del contenedor conectado */}
                {connectedContainer && (
                    <Card className="shadow-sm border-eco-emerald/20 rounded-xl bg-gradient-to-br from-eco-lime/10 to-eco-emerald/10 animate-fade-in">
                        <CardHeader>
                            <CardTitle className="text-xl text-eco-forest flex items-center">
                                <Recycle
                                    className={`h-6 w-6 mr-2 ${connectedContainer.type === "Plastic"
                                        ? "text-blue-500"
                                        : connectedContainer.type === "Paper"
                                            ? "text-green-500"
                                            : connectedContainer.type === "Glass"
                                                ? "text-teal-500"
                                                : "text-gray-500"
                                        }`}
                                />
                                Connected Container
                            </CardTitle>
                            <CardDescription className="text-eco-forest/70">
                                Details of the container you are accessing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-eco-forest/80">Type</span>
                                <span className="text-sm font-semibold text-eco-forest">
                                    {connectedContainer.type}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-eco-forest/80">Location</span>
                                <span className="text-sm font-semibold text-eco-forest flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-eco-emerald" />
                                    {connectedContainer.location}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-eco-forest/80">Material</span>
                                <span className="text-sm font-semibold text-eco-forest">
                                    {connectedContainer.material}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-eco-forest/80">Status</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${connectedContainer.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-amber-100 text-amber-800"
                                        }`}
                                >
                                    {connectedContainer.status}
                                </span>
                            </div>
                            {connectedContainer.status === "Maintenance" && (
                                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                                    This container is under maintenance. Access may be limited.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </TooltipProvider>
    );
}