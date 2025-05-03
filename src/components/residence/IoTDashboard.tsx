import { useState, useEffect } from "react";
import {
    ArrowUp,
    Recycle,
    BarChart3,
    Weight,
    Droplets,
    Leaf,
    CircleDollarSign,
    Info,
    Layers,
    MapPin,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// Mock data for container sensors
const mockContainerData = [
    {
        id: 1,
        type: "Plastic",
        status: "Active",
        fillLevel: 68,
        weight: 12.4,
        material: "PET",
        tokenRewards: 24.6,
        carbonOffset: 3.2,
        location: "Building A",
    },
    {
        id: 2,
        type: "Paper",
        status: "Active",
        fillLevel: 43,
        weight: 8.7,
        material: "Mixed Paper",
        tokenRewards: 17.4,
        carbonOffset: 2.5,
        location: "Building A",
    },
    {
        id: 3,
        type: "Glass",
        status: "Active",
        fillLevel: 25,
        weight: 15.2,
        material: "Mixed Glass",
        tokenRewards: 30.4,
        carbonOffset: 1.8,
        location: "Building B",
    },
    {
        id: 4,
        type: "Metal",
        status: "Maintenance",
        fillLevel: 0,
        weight: 0,
        material: "Aluminum",
        tokenRewards: 0,
        carbonOffset: 0,
        location: "Building B",
    },
];

// Mock data for the recycling history chart
const mockRecyclingHistory = [
    { name: "Jan", plastic: 45, paper: 30, glass: 20, metal: 10 },
    { name: "Feb", plastic: 50, paper: 25, glass: 30, metal: 15 },
    { name: "Mar", plastic: 35, paper: 45, glass: 20, metal: 20 },
    { name: "Apr", plastic: 40, paper: 40, glass: 25, metal: 30 },
    { name: "May", plastic: 55, paper: 35, glass: 30, metal: 25 },
    { name: "Jun", plastic: 60, paper: 40, glass: 35, metal: 30 },
];

// Mock data for the carbon offset chart
const mockCarbonOffset = [
    { name: "Jan", carbon: 2.4 },
    { name: "Feb", carbon: 3.1 },
    { name: "Mar", carbon: 2.8 },
    { name: "Apr", carbon: 3.5 },
    { name: "May", carbon: 4.2 },
    { name: "Jun", carbon: 4.8 },
];

export function IoTDashboard() {
    const [totalTokens, setTotalTokens] = useState(0);
    const [totalCarbon, setTotalCarbon] = useState(0);
    const [selectedContainer, setSelectedContainer] = useState(null);

    useEffect(() => {
        // Calculate total tokens and carbon offset
        const tokens = mockContainerData.reduce((acc, container) => acc + container.tokenRewards, 0);
        const carbon = mockContainerData.reduce((acc, container) => acc + container.carbonOffset, 0);

        setTotalTokens(tokens);
        setTotalCarbon(carbon);
    }, []);

    const handleViewDetails = (container) => {
        setSelectedContainer(container);
    };

    const handleCloseModal = () => {
        setSelectedContainer(null);
    };

    return (
        <TooltipProvider>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                {/* Encabezado principal */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-eco-forest">Recycling Dashboard</h1>
                    <p className="text-eco-forest/60 mt-2">
                        Track your recycling progress and environmental impact
                    </p>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-0 rounded-xl hover:scale-105 transition-transform duration-200 bg-eco-forest/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-eco-forest/80 flex items-center">
                                <Layers className="h-4 w-4 mr-2 text-eco-emerald" />
                                Total Containers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-eco-forest">4</div>
                                <div className="text-xs text-green-600 flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    +1 this month
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-xl hover:scale-105 transition-transform duration-200 bg-eco-forest/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-eco-forest/80 flex items-center">
                                <Weight className="h-4 w-4 mr-2 text-eco-emerald" />
                                Total Weight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-eco-forest">36.3 kg</div>
                                <div className="text-xs text-green-600 flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    +5.2 today
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-xl hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-eco-emerald/80 to-eco-forest/80 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/90 flex items-center">
                                <CircleDollarSign className="h-4 w-4 mr-2" />
                                CYCLE Tokens
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 ml-2 opacity-70" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Tokens earned for recycling materials
                                    </TooltipContent>
                                </UITooltip>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{totalTokens.toFixed(1)}</div>
                                <div className="text-xs text-white/80 flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    +12.8 this week
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-xl hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-eco-lime/80 to-eco-emerald/80 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/90 flex items-center">
                                <Leaf className="h-4 w-4 mr-2" />
                                CO₂ Saved
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 ml-2 opacity-70" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Carbon dioxide emissions prevented through recycling
                                    </TooltipContent>
                                </UITooltip>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{totalCarbon.toFixed(1)} kg</div>
                                <div className="text-xs text-white/80 flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    +0.8 today
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <Card className="lg:col-span-8 shadow-sm border-0 rounded-xl bg-white">
                        <CardHeader className="bg-eco-forest/5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl text-eco-forest">
                                        Recycling Activity
                                    </CardTitle>
                                    <CardDescription className="text-eco-forest/70">
                                        Monthly recycling by material type (kg)
                                    </CardDescription>
                                </div>
                                <UITooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-eco-forest hover:bg-eco-forest/10"
                                        >
                                            <BarChart3 className="h-5 w-5 mr-2" />
                                            Export
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Download recycling data as CSV
                                    </TooltipContent>
                                </UITooltip>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={mockRecyclingHistory}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                                    >
                                        <defs>
                                            <linearGradient id="plasticGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#84CC16" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#84CC16" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2C6E31" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#2C6E31" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A8C4F" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4A8C4F" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Area
                                            type="monotone"
                                            dataKey="plastic"
                                            name="Plastic"
                                            stroke="#10B981"
                                            fillOpacity={1}
                                            fill="url(#plasticGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="paper"
                                            name="Paper"
                                            stroke="#84CC16"
                                            fillOpacity={1}
                                            fill="url(#paperGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="glass"
                                            name="Glass"
                                            stroke="#2C6E31"
                                            fillOpacity={1}
                                            fill="url(#glassGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="metal"
                                            name="Metal"
                                            stroke="#4A8C4F"
                                            fillOpacity={1}
                                            fill="url(#metalGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4 shadow-sm border-0 rounded-xl bg-white">
                        <CardHeader className="bg-eco-forest/5">
                            <CardTitle className="text-xl text-eco-forest">
                                CO₂ Reduction
                            </CardTitle>
                            <CardDescription className="text-eco-forest/70">
                                Monthly CO₂ saved (kg)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={mockCarbonOffset}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="carbon"
                                            name="CO₂ Saved"
                                            fill="#34D399"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Smart Containers */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-eco-forest">
                                Smart Containers
                            </h3>
                            <p className="text-eco-forest/70 text-sm">
                                Monitor the status of your recycling containers
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockContainerData.map((container) => (
                            <Card
                                key={container.id}
                                className={`shadow-sm border-0 rounded-xl hover:shadow-md transition-shadow duration-200 ${container.status === "Maintenance" ? "opacity-70 bg-gray-50" : "bg-white"
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center text-lg text-eco-forest">
                                                <Recycle
                                                    className={`h-6 w-6 mr-2 ${container.type === "Plastic"
                                                        ? "text-blue-500"
                                                        : container.type === "Paper"
                                                            ? "text-green-500"
                                                            : container.type === "Glass"
                                                                ? "text-teal-500"
                                                                : "text-gray-500"
                                                        }`}
                                                />
                                                {container.type}
                                            </CardTitle>
                                            <CardDescription className="text-eco-forest/70">
                                                {container.location} · {container.material}
                                            </CardDescription>
                                        </div>
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${container.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-amber-100 text-amber-800"
                                                }`}
                                        >
                                            {container.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-eco-forest/80">Fill Level</span>
                                                <span className="font-semibold">{container.fillLevel}%</span>
                                            </div>
                                            <UITooltip>
                                                <TooltipTrigger asChild>
                                                    <Progress
                                                        value={container.fillLevel}
                                                        className={`h-3 ${container.type === "Plastic"
                                                            ? "bg-blue-100"
                                                            : container.type === "Paper"
                                                                ? "bg-green-100"
                                                                : container.type === "Glass"
                                                                    ? "bg-teal-100"
                                                                    : "bg-gray-100"
                                                            }`}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {container.fillLevel}% Full
                                                </TooltipContent>
                                            </UITooltip>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-eco-forest/80 mb-1">Weight</span>
                                                <span className="font-semibold flex items-center">
                                                    <Weight className="h-4 w-4 mr-1 text-eco-forest/80" />
                                                    {container.weight} kg
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-eco-forest/80 mb-1">Tokens</span>
                                                <span className="font-semibold flex items-center">
                                                    <CircleDollarSign className="h-4 w-4 mr-1 text-eco-emerald" />
                                                    {container.tokenRewards}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-eco-forest/80 mb-1">CO₂ Saved</span>
                                                <span className="font-semibold flex items-center">
                                                    <Leaf className="h-4 w-4 mr-1 text-eco-lime" />
                                                    {container.carbonOffset} kg
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <UITooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-eco-forest hover:bg-eco-forest/10"
                                                onClick={() => handleViewDetails(container)}
                                            >
                                                <Info className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            See detailed container metrics and history
                                        </TooltipContent>
                                    </UITooltip>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Modal para detalles del contenedor */}
                <Dialog open={!!selectedContainer} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-eco-forest flex items-center">
                                <Recycle
                                    className={`h-6 w-6 mr-2 ${selectedContainer?.type === "Plastic"
                                        ? "text-blue-500"
                                        : selectedContainer?.type === "Paper"
                                            ? "text-green-500"
                                            : selectedContainer?.type === "Glass"
                                                ? "text-teal-500"
                                                : "text-gray-500"
                                        }`}
                                />
                                {selectedContainer?.type} Container
                            </DialogTitle>
                            <DialogDescription className="text-eco-forest/70">
                                Detailed information about the {selectedContainer?.type.toLowerCase()} container
                            </DialogDescription>
                        </DialogHeader>
                        {selectedContainer && (
                            <div className="space-y-6 py-4">
                                {/* Estado del contenedor */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">Status</span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedContainer.status === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-amber-100 text-amber-800"
                                            }`}
                                    >
                                        {selectedContainer.status}
                                    </span>
                                </div>

                                {/* Ubicación */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">Location</span>
                                    <span className="text-sm font-semibold text-eco-forest flex items-center">
                                        <MapPin className="h-4 w-4 mr-1 text-eco-emerald" />
                                        {selectedContainer.location}
                                    </span>
                                </div>

                                {/* Material */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">Material</span>
                                    <span className="text-sm font-semibold text-eco-forest">
                                        {selectedContainer.material}
                                    </span>
                                </div>

                                {/* Nivel de llenado */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-eco-forest/80">Fill Level</span>
                                        <span className="font-semibold">{selectedContainer.fillLevel}%</span>
                                    </div>
                                    <Progress
                                        value={selectedContainer.fillLevel}
                                        className={`h-3 ${selectedContainer.type === "Plastic"
                                            ? "bg-blue-100"
                                            : selectedContainer.type === "Paper"
                                                ? "bg-green-100"
                                                : selectedContainer.type === "Glass"
                                                    ? "bg-teal-100"
                                                    : "bg-gray-100"
                                            }`}
                                    />
                                </div>

                                {/* Peso */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">Weight</span>
                                    <span className="text-sm font-semibold text-eco-forest flex items-center">
                                        <Weight className="h-4 w-4 mr-1 text-eco-forest/80" />
                                        {selectedContainer.weight} kg
                                    </span>
                                </div>

                                {/* Tokens */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">CYCLE Tokens</span>
                                    <span className="text-sm font-semibold text-eco-forest flex items-center">
                                        <CircleDollarSign className="h-4 w-4 mr-1 text-eco-emerald" />
                                        {selectedContainer.tokenRewards}
                                    </span>
                                </div>

                                {/* CO₂ ahorrado */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">CO₂ Saved</span>
                                    <span className="text-sm font-semibold text-eco-forest flex items-center">
                                        <Leaf className="h-4 w-4 mr-1 text-eco-lime" />
                                        {selectedContainer.carbonOffset} kg
                                    </span>
                                </div>

                                {/* Última actualización (mock) */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-eco-forest/80">Last Updated</span>
                                    <span className="text-sm text-eco-forest">{new Date().toLocaleString()}</span>
                                </div>

                                {/* Mensaje para mantenimiento */}
                                {selectedContainer.status === "Maintenance" && (
                                    <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                                        This container is currently under maintenance and not collecting waste.
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                className="text-eco-forest hover:bg-eco-forest/10"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}