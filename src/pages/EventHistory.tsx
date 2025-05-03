import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, ArrowLeft, Recycle, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Web3 from "web3";

// ABI del contrato
const VERIFY_EVENT_ABI = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "user", type: "address" },
            { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "weight", type: "uint256" },
        ],
        name: "WasteDeposited",
        type: "event",
    },
];

const CORE_ABI = [
    {
        inputs: [{ internalType: "uint256", name: "eventId", type: "uint256" }],
        name: "verifyEvent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
];

const contractAddress = "0x81C0734Ab8ABcDDa159fB058610747fA4E83790d";
const CONTRACT_ADDRESS = "0x81C0734Ab8ABcDDa159fB058610747fA4E83790d";
const VERIFIER_ROLE = Web3.utils.keccak256("VERIFIER_ROLE");

// Mock events
const mockEvents = [
    {
        eventId: "0x233b7c5ce11ac435eaa195d85bf320007139b96919f1050c1c5e0a4c3c1814fc",
        user: "0xEBf748F482367cDe60c53abBae3Bd4e130eD656F",
        weight: "0.000000000000000005",
        timestamp: "2025-04-25T10:30:00Z",
        type: "Plastic",
        isValidated: false,
    },
    {
        eventId: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        user: "0x1234567890abcdef1234567890abcdef12345678",
        weight: "0.000000000000000010",
        timestamp: "2025-04-24T15:45:00Z",
        type: "Paper",
        isValidated: false,
    },
    {
        eventId: "0x1111111111111111111111111111111111111111111111111111111111111111",
        user: "0x9876543210fedcba9876543210fedcba98765432",
        weight: "0.000000000000000008",
        timestamp: "2025-04-23T08:20:00Z",
        type: "Glass",
        isValidated: true,
    },
];

const EventHistoryPage = () => {
    const [eventId, setEventId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [userFilter, setUserFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<any[]>(mockEvents);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { toast } = useToast();

    // Conectar a Web3 y verificar red
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: "eth_requestAccounts" });
                    const chainId = await window.ethereum.request({ method: "eth_chainId" });
                    if (chainId !== "0xa869") {
                        toast({
                            variant: "destructive",
                            title: "Wrong Network",
                            description: "Please switch to Avalanche Fuji C-Chain.",
                        });
                        return;
                    }
                    const web3 = new Web3(window.ethereum);
                    const contract = new web3.eth.Contract(VERIFY_EVENT_ABI, contractAddress);
                } catch (error) {
                    console.error("Error al conectar con MetaMask:", error);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "MetaMask Not Detected",
                    description: "Please install MetaMask.",
                });
            }
        };

        initWeb3();

        return () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                const contract = new web3.eth.Contract(VERIFY_EVENT_ABI, contractAddress);
                contract.removeAllListeners("WasteDeposited");
            }
        };
    }, []);

    // Filtrar eventos
    const filterEvents = (eventsToFilter: any[]) => {
        return eventsToFilter.filter((event) => {
            const eventDate = new Date(event.timestamp).getTime();
            const start = startDate ? new Date(startDate).getTime() : -Infinity;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            const matchesDate = eventDate >= start && eventDate <= end;
            const matchesUser = userFilter
                ? event.user.toLowerCase().includes(userFilter.toLowerCase())
                : true;
            return matchesDate && matchesUser;
        });
    };

    // Buscar eventos por ID
    const fetchTransactionHistory = async (eventId: string) => {
        setLoading(true);
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(VERIFY_EVENT_ABI, contractAddress);
            const latestBlock = Number(await web3.eth.getBlockNumber());
            const startBlock = latestBlock - 20000;
            const batchSize = 2000;
            let allEvents: any[] = [];

            for (let i = startBlock; i <= latestBlock; i += batchSize) {
                const toBlock = Math.min(i + batchSize - 1, latestBlock);
                const events = await contract.getPastEvents("WasteDeposited", {
                    fromBlock: i,
                    toBlock: toBlock,
                });
                allEvents = [...allEvents, ...events];
            }

            const filteredEvents = allEvents.filter(
                (event) => event.transactionHash.toLowerCase() === eventId.toLowerCase()
            );

            if (filteredEvents.length === 0) {
                toast({
                    title: "No Results",
                    description: "No events found with that ID.",
                });
            }

            const newEvents = filteredEvents.map((e) => ({
                eventId: e.transactionHash,
                user: e.returnValues.user,
                weight: web3.utils.fromWei(e.returnValues.weight, "ether"),
                timestamp: new Date().toISOString(), // Mock timestamp for real events
                type: "Unknown", // Mock type for real events
                isValidated: false,
            }));

            setEvents([...mockEvents, ...newEvents]);
        } catch (error) {
            console.error("Error al buscar eventos:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch events.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Validar evento
    const handleValidateEvent = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(CORE_ABI, CONTRACT_ADDRESS);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            // Verificar rol de validador
            const hasVerifierRole = await contract.methods
                .hasRole(VERIFIER_ROLE, account)
                .call();
            if (!hasVerifierRole) {
                toast({
                    variant: "destructive",
                    title: "Unauthorized",
                    description: "You do not have the verifier role.",
                });
                setIsModalOpen(false);
                return;
            }

            // Llamar a verifyEvent
            await contract.methods.verifyEvent(selectedEventId).send({ from: account });

            // Actualizar estado
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.eventId === selectedEventId
                        ? { ...event, isValidated: true }
                        : event
                )
            );

            toast({
                title: "Success",
                description: "Event validated successfully!",
            });
        } catch (error) {
            console.error("Error validating event:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to validate event.",
            });
        } finally {
            setIsModalOpen(false);
            setSelectedEventId(null);
        }
    };

    const handleCheckEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventId) {
            fetchTransactionHistory(eventId);
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Event ID",
                description: "Please enter a valid event ID.",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-eco-lime/5 to-eco-emerald/5">
            <Navbar />

            <header className="bg-eco-forest-light/10 py-4 px-4 md:px-6 border-b border-eco-emerald/20">
                <div className="container mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        asChild
                        className="text-sm text-eco-forest hover:bg-eco-emerald/10"
                    >
                        <a href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </a>
                    </Button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-eco-forest flex items-center justify-center">
                            <Recycle className="h-8 w-8 mr-2 text-eco-emerald" />
                            Event Validation
                        </h1>
                        <p className="text-eco-forest/70 mt-1">
                            Verify recycling events to ensure legitimacy
                        </p>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </header>

            <main className="flex-grow">
                <div className="container mx-auto px-4 py-10 max-w-4xl">
                    {/* Tarjeta de filtros */}
                    <Card className="mb-8 shadow-sm border-0 rounded-xl bg-eco-lime/10">
                        <CardHeader>
                            <CardTitle className="text-xl text-eco-forest">
                                Filter Events
                            </CardTitle>
                            <CardDescription className="text-eco-forest/70">
                                Narrow down events by date or user address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest/80 mb-1">
                                        Start Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="text-eco-forest"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest/80 mb-1">
                                        End Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="text-eco-forest"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-eco-forest/80 mb-1">
                                        User Address
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="0x1234..."
                                        value={userFilter}
                                        onChange={(e) => setUserFilter(e.target.value)}
                                        className="text-eco-forest"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full text-eco-forest hover:bg-eco-emerald/10"
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    setUserFilter("");
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Formulario de búsqueda */}
                    <form onSubmit={handleCheckEvent} className="mb-8">
                        <Card className="shadow-sm border-0 rounded-xl bg-white">
                            <CardHeader>
                                <CardTitle className="text-xl text-eco-forest">
                                    Search Event by ID
                                </CardTitle>
                                <CardDescription className="text-eco-forest/70">
                                    Enter the transaction ID to find a specific event
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="0x1234...abcd"
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                    className="flex-1 text-eco-forest"
                                />
                                <Button
                                    type="submit"
                                    className="bg-eco-emerald text-white hover:bg-eco-emerald/90"
                                >
                                    Search
                                </Button>
                            </CardContent>
                        </Card>
                    </form>

                    {/* Lista de eventos */}
                    {loading ? (
                        <Card className="shadow-sm border-0 rounded-xl bg-white text-center p-6">
                            <p className="text-eco-forest/70">Loading events...</p>
                        </Card>
                    ) : filterEvents(events).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filterEvents(events).map((event, index) => (
                                <Card
                                    key={index}
                                    className="shadow-sm border-eco-emerald/20 rounded-xl bg-white animate-fade-in"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg text-eco-forest flex items-center">
                                            <Recycle
                                                className={`h-5 w-5 mr-2 ${event.type === "Plastic"
                                                    ? "text-blue-500"
                                                    : event.type === "Paper"
                                                        ? "text-green-500"
                                                        : event.type === "Glass"
                                                            ? "text-teal-500"
                                                            : "text-gray-500"
                                                    }`}
                                            />
                                            Event {event.eventId.slice(0, 6)}...
                                        </CardTitle>
                                        <CardDescription className="text-eco-forest/70">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-eco-forest">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Event ID:</span>
                                            <span className="truncate max-w-[150px]">{event.eventId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">User:</span>
                                            <span className="truncate max-w-[150px]">{event.user}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Weight:</span>
                                            <span>{event.weight} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Status:</span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${event.isValidated
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-amber-100 text-amber-800"
                                                    }`}
                                            >
                                                {event.isValidated ? "Validated" : "Pending"}
                                            </span>
                                        </div>
                                        {!event.isValidated && (
                                            <Button
                                                className="w-full bg-eco-emerald text-white hover:bg-eco-emerald/90 hover:scale-105 transition-transform duration-200"
                                                onClick={() => {
                                                    setSelectedEventId(event.eventId);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Validate
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm border-0 rounded-xl bg-white text-center p-6">
                            <p className="text-eco-forest/70 italic">
                                No events found with the applied filters.
                            </p>
                        </Card>
                    )}
                </div>
            </main>

            {/* Modal de confirmación */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-xl shadow-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-eco-forest flex items-center">
                            <CheckCircle className="h-6 w-6 mr-2 text-eco-emerald" />
                            Confirm Event Validation
                        </DialogTitle>
                        <DialogDescription className="text-eco-forest/70">
                            Are you sure you want to validate this recycling event? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 text-eco-forest hover:bg-eco-emerald/10"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-eco-emerald text-white hover:bg-eco-emerald/90"
                            onClick={handleValidateEvent}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default EventHistoryPage;