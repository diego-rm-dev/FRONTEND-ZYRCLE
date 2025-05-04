import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle, Recycle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Web3 from "web3";
import AbiCore from "@/lib/Abis";

const CONTRACT_ABI = AbiCore;
const CONTRACT_ADDRESS = "0x3B677E9ab4C216433Aadc61341DB3C750B493C1b";
const VERIFIER_ROLE = Web3.utils.keccak256("VERIFIER_ROLE");

const EventHistoryPage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [viewMode, setViewMode] = useState<"recycling" | "dropoff">("recycling");
    const { toast } = useToast();
    const loadEvents = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            const latestBlock = await web3.eth.getBlockNumber();

            const recyclingEvents = await contract.getPastEvents("WasteDeposited", {
                fromBlock: Number(latestBlock) - 2000, // Convert BigInt to number
                toBlock: "latest",
            });

            const dropoffEvents = await contract.getPastEvents("BatchDelivered", {
                fromBlock: Number(latestBlock) - 2000, // Convert BigInt to number
                toBlock: "latest",
            });

            const recyclingEnriched = await Promise.all(
                recyclingEvents.map(async (e) => {
                    const block = await web3.eth.getBlock(Number(e.blockNumber)); // Convert BigInt to number
                    const full = await contract.methods.getEvent(e.returnValues.eventId).call();

                    const weightStr = e.returnValues.weight.toString(); // Convert BigInt to string

                    return {
                        type: "recycling",
                        eventId: Number(e.returnValues.eventId), // Convert BigInt to number
                        user: e.returnValues.user,
                        weight: web3.utils.fromWei(weightStr, "ether"),
                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(), // Safe conversion
                        isValidated: full.verified,
                    };
                })
            );

            const dropoffEnriched = await Promise.all(
                dropoffEvents.map(async (e) => {
                    const block = await web3.eth.getBlock(Number(e.blockNumber)); // Convert BigInt to number

                    return {
                        type: "dropoff",
                        batchId: Number(e.returnValues.batchId), // Convert BigInt to number
                        user: e.returnValues.collector,
                        containerIds: e.returnValues.containerIds.map((id) => Number(id)), // Convert BigInt to number
                        totalWeight: Number(e.returnValues.totalWeight.toString()) / 1000, // Safe conversion
                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(), // Safe conversion
                    };
                })
            );

            setEvents([...recyclingEnriched, ...dropoffEnriched]);
        } catch (err) {
            console.error("Error loading events:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch events from blockchain.",
            });
        }
    };


    useEffect(() => {
        loadEvents();
        const interval = setInterval(loadEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleValidateEvent = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            const hasVerifierRole = await contract.methods.hasRole(VERIFIER_ROLE, account).call();
            if (!hasVerifierRole) {
                toast({
                    variant: "destructive",
                    title: "Unauthorized",
                    description: "You do not have the verifier role.",
                });
                return;
            }

            await contract.methods.verifyEvent(selectedEventId).send({ from: account });
            await loadEvents();

            toast({
                title: "Success",
                description: "Event validated successfully.",
            });
        } catch (err) {
            console.error("Validation failed:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to validate event.",
            });
        } finally {
            setIsModalOpen(false);
        }
    };

    const filteredEvents = events.filter((e) => (viewMode === "recycling" ? e.type === "recycling" : e.type === "dropoff"))
        .filter((event) => {
            const eventDate = new Date(event.timestamp).getTime();
            const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
            const to = dateTo ? new Date(dateTo).getTime() : Infinity;
            const matchesDate = eventDate >= from && eventDate <= to;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "validated" && event.isValidated) ||
                (statusFilter === "pending" && !event.isValidated);

            return matchesDate && matchesStatus;
        });

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow px-4 py-8 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-eco-forest mb-2 flex items-center">
                        <Recycle className="h-6 w-6 mr-2 text-eco-emerald" /> Validator Panel
                    </h2>
                    <p className="text-sm text-eco-forest/70">Manage and filter all recycling events in real time.</p>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="text-sm font-medium text-eco-forest">From Date</label>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-eco-forest">To Date</label>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-eco-forest">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full">
                                <span className="capitalize">{statusFilter}</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="validated">Validated</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button variant="outline" className="w-full" onClick={() => {
                            setDateFrom("");
                            setDateTo("");
                            setStatusFilter("all");
                        }}>
                            Reset Filters
                        </Button>
                    </div>
                </div>
                <div className="flex justify-end mb-4">
                    <Button
                        variant="outline"
                        onClick={() =>
                            setViewMode(viewMode === "recycling" ? "dropoff" : "recycling")
                        }
                    >
                        View: {viewMode === "recycling" ? "Drop-off Events" : "Recycling Events"}
                    </Button>
                </div>

                {/* Lista de eventos */}
                {filteredEvents.map((event, index) => (
                    <Card key={index} className="shadow-sm border rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-eco-forest flex items-center">
                                <Recycle className="h-5 w-5 mr-2 text-eco-emerald" />
                                {event.type === "recycling"
                                    ? `Recycling #${event.eventId}`
                                    : `Drop-off #${event.batchId}`}
                            </CardTitle>
                            <CardDescription className="text-eco-forest/70">
                                {new Date(event.timestamp).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-eco-forest">
                            <div>User: {event.user}</div>

                            {event.type === "recycling" ? (
                                <>
                                    <div>Weight: {event.weight} kg</div>
                                    <div>
                                        Status:{" "}
                                        {event.isValidated ? (
                                            <span className="text-green-600 font-medium">Validated</span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium">Pending</span>
                                        )}
                                    </div>
                                    {!event.isValidated && (
                                        <Button
                                            className="w-full mt-2 bg-eco-emerald text-white"
                                            onClick={() => {
                                                setSelectedEventId(event.eventId);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Validate
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>Total Weight: {event.totalWeight} kg</div>
                                    <div>Containers: {event.containerIds.join(", ")}</div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </main>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-xl shadow-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-eco-forest flex items-center">
                            <CheckCircle className="h-6 w-6 mr-2 text-eco-emerald" /> Confirm Validation
                        </DialogTitle>
                        <DialogDescription className="text-eco-forest/70">
                            Are you sure you want to validate this event?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-eco-emerald text-white" onClick={handleValidateEvent}>
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
