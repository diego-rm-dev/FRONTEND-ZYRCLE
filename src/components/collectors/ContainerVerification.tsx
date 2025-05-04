import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { PinataSDK } from "pinata";
import { Footer } from "@/components/layout/Footer";
import Web3 from "web3";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CheckCircle,
    Camera,
    QrCode,
    UploadCloud,
    Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QRCodeScanner from "./QRCodeScanner";
import axios from "axios";
import { configDotenv } from 'dotenv'
import AbiCore from "@/lib/Abis";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "../ui/dialog";

export function ContainerVerification() {
    const { containerId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [containerData, setContainerData] = useState(state?.container || null);
    const [qrScanned, setQrScanned] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [contentId, setContentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();


    useEffect(() => {
        console.log("containerId is:", containerId);

        if (!containerData && containerId) {
            console.log("POST request triggered with code:", containerId);

            fetch("https://zyrcle-backend.diegormdev.site/api/contenedor/validar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: containerId }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setContainerData(data);
                    setQrScanned(true);
                    setError(null);
                    console.log("Response from backend:", data);
                })
                .catch((err) => {
                    console.error("Error fetching container:", err);
                    setError("Failed to validate container code.");
                });
        }
    }, [containerId, containerData]);

    const handleQrScan = async (result: string) => {
        if (!/^\d{6}$/.test(result)) {
            setError("Invalid QR code. Must be a 6-digit number.");
            return;
        }

        try {
            const response = await fetch("https://zyrcle-backend.diegormdev.site/api/contenedor/validar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: result }),
            });

            const validation = await response.json();

            if (response.ok && validation.message === "Acceso permitido") {
                setQrScanned(true);
                setError(null);

                // ✅ Obtener lista de contenedores
                const listResponse = await fetch("https://zyrcle-backend.diegormdev.site/api/rutas/quemadas");
                const containers = await listResponse.json();

                // ✅ Elegir uno aleatorio
                const randomIndex = Math.floor(Math.random() * containers.length);
                const selectedContainer = containers[randomIndex];

                setContainerData(selectedContainer);
            } else {
                setError(validation.message || "Invalid QR code.");
            }
        } catch (err) {
            console.error("Error during QR validation or container fetching:", err);
            setError("Failed to validate QR or load container data.");
        }
    };


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError(null);
        } else {
            setError("Please select a valid image file.");
        }
    };

    const uploadToPinata = async (file: File) => {
        const PINATA_API_KEY = import.meta.env.VITE_API_PINATA_ENV;
        const PINATA_SECRET_API_KEY = import.meta.env.VITE_API_SECRET_ENV;
        const formData = new FormData();
        formData.append("file", file);
        try {
            setUploading(true);
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
            });
            const cid = response.data.IpfsHash;
            setContentId(cid);
            return cid;
        } catch (err) {
            setError("Failed to upload image to Pinata.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!qrScanned) {
            setError("Please scan the container QR code or validate a manual code.");
            return;
        }
        if (!photo) {
            setError("Please upload a photo of the open container.");
            return;
        }

        const cid = await uploadToPinata(photo);
        if (!cid) return;

        const verificationData = {
            containerId: containerData.id,
            address: containerData.address,
            type: containerData.type,
            estimatedWeight: containerData.estimatedWeight,
            fillPercentage: containerData.fillPercentage,
            status: containerData.status,
            photoCid: cid,
            timestamp: new Date().toISOString(),
        };

        await saveToBlockchain(verificationData);
        toast({
            title: "Container Collected",
            description: "This container has been marked as collected and recorded successfully.",
            duration: 4000,
        });

        const visited = JSON.parse(localStorage.getItem("visitedRoutes") || "[]");
        if (!visited.includes(containerData.id)) {
            visited.push(containerData.id);
            localStorage.setItem("visitedRoutes", JSON.stringify(visited));
        }

        navigate("/collectors", {
            state: { message: "Container verified", preserveRoute: true }
        });

    };

    const saveToBlockchain = async (data: any) => {
        try {
            if (!window.ethereum) {
                setError("No Ethereum provider detected. Please install MetaMask.");
                return;
            }

            // Solicita acceso a la cuenta
            await window.ethereum.request({ method: "eth_requestAccounts" });

            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            const contract = new web3.eth.Contract(AbiCore, "0xe04244Fc660366715D724944d7078775fdCf8318");

            // Asumiendo que el peso viene en kg y lo convertimos a gramos
            const weightInGrams = Math.floor(data.estimatedWeight * 1000);

            // Ejecutar el método confirmCollection(address collector, uint256 containerId, string type, string cid, uint256 weight)
            await contract.methods
                .confirmCollection(account, data.containerId, data.type, data.photoCid, weightInGrams)
                .send({ from: account })
                .on("receipt", (receipt) => {
                    console.log("Transaction receipt:", receipt);

                    const event = receipt.events.CollectionConfirmed; // nombre del evento que definiste
                    if (event) {
                        console.log("Event data:", event.returnValues);
                    }
                })
                .on("error", (error) => {
                    console.error("Transaction failed:", error);
                });

            console.log("Collection event recorded successfully.");
        } catch (err) {
            console.error("Error sending transaction:", err);
            setError("Failed to save collection event on blockchain.");
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(manualCode)) {
            setError("Please enter a valid 6-digit code.");
            return;
        }

        try {
            const response = await fetch("https://zyrcle-backend.diegormdev.site/api/contenedor/validar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: manualCode }),
            });

            const validation = await response.json();

            if (response.ok && validation.message === "Acceso permitido") {
                setQrScanned(true);
                setError(null);

                // ✅ Obtener lista de contenedores
                const listResponse = await fetch("https://zyrcle-backend.diegormdev.site/api/rutas/quemadas");
                const containers = await listResponse.json();

                // ✅ Elegir uno aleatorio
                const randomIndex = Math.floor(Math.random() * containers.length);
                const selectedContainer = containers[randomIndex];

                setContainerData(selectedContainer);
            } else {
                setError(validation.message || "Invalid code.");
            }
        } catch (err) {
            console.error("Error during validation or fetching containers:", err);
            setError("Error validating code or loading containers.");
        }
    };


    const statusColor = (status: string) => {
        switch (status) {
            case "Urgent": return "text-red-600 bg-red-100";
            case "High": return "text-orange-600 bg-orange-100";
            case "Medium": return "text-yellow-600 bg-yellow-100";
            case "Low": return "text-green-600 bg-green-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-md border-0 rounded-xl">
                        <CardHeader className="bg-eco-forest/5">
                            <CardTitle className="flex items-center text-2xl text-eco-forest">
                                <CheckCircle className="h-6 w-6 mr-2 text-eco-emerald" />
                                Verify Container
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Input Manual de Código */}
                            {!qrScanned && (
                                <div className="space-y-2">
                                    <Button variant="outline" onClick={() => setShowManualInput(!showManualInput)}>
                                        {showManualInput ? (
                                            <>
                                                <QrCode className="h-4 w-4 mr-2" />
                                                Scan QR Instead
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Enter Code Manually
                                            </>
                                        )}
                                    </Button>
                                    {showManualInput ? (
                                        <form onSubmit={handleManualSubmit} className="space-y-2">
                                            <Input
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value)}
                                                className="text-center text-lg"
                                            />
                                            <Button type="submit" className="w-full bg-eco-emerald text-white">
                                                Submit Code
                                            </Button>
                                        </form>
                                    ) : (
                                        <QRCodeScanner onScan={handleQrScan} />
                                    )}
                                </div>
                            )}

                            {qrScanned && containerData && (
                                <div className="space-y-6">
                                    {/* Información del contenedor */}
                                    <div className="p-6 bg-white rounded-2xl shadow border border-gray-200">
                                        <h3 className="text-xl font-semibold text-eco-forest mb-4 flex items-center">
                                            <CheckCircle className="h-5 w-5 mr-2 text-eco-emerald" />
                                            Container Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-eco-forest">
                                            <div><span className="font-semibold">Address:</span> {containerData.address}</div>
                                            <div><span className="font-semibold">Type:</span> {containerData.type}</div>
                                            <div><span className="font-semibold">Weight:</span> {containerData.estimatedWeight} kg</div>
                                            <div><span className="font-semibold">Fill Level:</span> {containerData.fillPercentage}%</div>
                                        </div>
                                        <div className="mt-4">
                                            <Badge className={`${statusColor(containerData.status)} px-3 py-1 rounded-full text-sm font-medium`}>
                                                {containerData.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Subida de foto */}
                                    <div className="space-y-3">
                                        <Label className="text-eco-forest font-medium">Upload a photo of the container</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                ref={fileInputRef}
                                                className="hidden"
                                            />
                                            <Button onClick={() => fileInputRef.current?.click()} className="bg-eco-lime text-white hover:bg-eco-lime-dark">
                                                <Camera className="w-4 h-4 mr-2" />
                                                Take Photo
                                            </Button>
                                        </div>
                                        {photoPreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="rounded-xl border border-gray-200 shadow-md max-w-full w-full sm:w-80"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {showConfirm && (
                                        <div className="mt-8 flex justify-center">
                                            <div className="bg-white border border-eco-emerald rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                                                <div className="flex items-center justify-center mb-3 text-eco-forest">
                                                    <CheckCircle className="h-6 w-6 mr-2 text-eco-emerald" />
                                                    <h3 className="text-xl font-semibold">Confirm Collection</h3>
                                                </div>
                                                <p className="text-sm text-eco-forest/70 mb-4">
                                                    Are you sure you want to confirm and save this collection?
                                                </p>
                                                <div className="flex justify-center gap-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowConfirm(false)}
                                                        className="px-6"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setShowConfirm(false);
                                                            handleSubmit();
                                                        }}
                                                        className="bg-eco-emerald text-white px-6"
                                                    >
                                                        Confirm
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón de envío */}
                                    <Button
                                        disabled={uploading}
                                        onClick={() => setShowConfirm(true)}
                                        className="w-full bg-eco-emerald hover:bg-eco-emerald-dark text-white"
                                    >
                                        <UploadCloud className="w-5 h-5 mr-2" />
                                        Submit Verification
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
