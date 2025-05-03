import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, BarChart3, Navigation, Layers, CheckCircle, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LeafletMap } from "./LeafletMap";

export function CollectorsMap() {
    const [containers, setContainers] = useState([]);
    const [collectionStats, setCollectionStats] = useState({
        todayWeight: 0,
        todayContainers: 0,
        weekWeight: 0,
        weekContainers: 0,
        co2Saved: 0,
    });

    // Estado para rutas visitadas
    const [visitedRoutes, setVisitedRoutes] = useState<string[]>([]);
    const [orderedContainers, setOrderedContainers] = useState([]);

    // Cargar rutas visitadas desde localStorage al montar el componente
    useEffect(() => {
        const savedVisited = localStorage.getItem("visitedRoutes");
        if (savedVisited) {
            setVisitedRoutes(JSON.parse(savedVisited));
        }
    }, []);

    // Actualizar orderedContainers cuando cambian containers o visitedRoutes
    useEffect(() => {
        const nonVisited = containers.filter((c) => !visitedRoutes.includes(c.id));
        const visited = containers.filter((c) => visitedRoutes.includes(c.id));
        setOrderedContainers([...nonVisited, ...visited]);
    }, [containers, visitedRoutes]);

    // Guardar visitedRoutes en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem("visitedRoutes", JSON.stringify(visitedRoutes));
    }, [visitedRoutes]);

    const calculateStats = (containers) => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        let todayWeight = 0;
        let todayContainers = 0;
        let weekWeight = 0;
        let weekContainers = 0;

        containers.forEach((container) => {
            const lastUpdatedDate = new Date(container.lastUpdated);
            const weight = container.estimatedWeight;
            console.log("this is my container: ", container);

            if (
                lastUpdatedDate.getUTCFullYear() === today.getUTCFullYear() &&
                lastUpdatedDate.getUTCMonth() === today.getUTCMonth() &&
                lastUpdatedDate.getUTCDate() === today.getUTCDate()
            ) {
                todayWeight += weight;
                todayContainers += 1;
            }
            {
                todayWeight += weight;
                todayContainers += 1;
            }

            if (lastUpdatedDate >= weekAgo) {
                weekWeight += weight;
                weekContainers += 1;
            }
        });

        const co2Saved = parseFloat(((todayWeight + weekWeight) * 0.18).toFixed(2));

        setCollectionStats({
            todayWeight,
            todayContainers,
            weekWeight,
            weekContainers,
            co2Saved,
        });

        console.log(todayWeight, todayContainers, weekWeight, weekContainers, co2Saved);
    };

    useEffect(() => {
        fetch("https://zyrcle-backend.diegormdev.site/api/rutas/quemadas")
            .then((res) => res.json())
            .then((data) => {
                console.log("containers received:", data);
                setContainers(data);
                calculateStats(data);
            })
            .catch((err) => console.error(err));
    }, []);

    const navigateTo = (container) => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${container.latitude},${container.longitude}&travelmode=driving`;
            window.open(googleMapsUrl, "_blank");
        });
        // Marcar la ruta como visitada y moverla al final
        setVisitedRoutes((prev) => {
            if (!prev.includes(container.id)) {
                return [...prev, container.id];
            }
            return prev;
        });
    };

    const resetVisitedRoutes = () => {
        setVisitedRoutes([]);
        localStorage.removeItem("visitedRoutes");
    };

    const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
    const [routeOptimized, setRouteOptimized] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(true);

    const optimizeRoute = () => {
        setRouteOptimized(true);
        setTimeout(() => {
            setSelectedContainer(1);
        }, 1000);
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "Urgent":
                return "text-red-600 bg-red-100";
            case "High":
                return "text-orange-600 bg-orange-100";
            case "Medium":
                return "text-yellow-600 bg-yellow-100";
            case "Low":
                return "text-green-600 bg-green-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    const estimateTime = (totalDistance) => {
        const averageSpeed = 30;
        return totalDistance / averageSpeed;
    };

    const [totalDistance, setTotalDistance] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);

    useEffect(() => {
        if (routeOptimized && containers.length > 1) {
            let totalDistanceCalc = 0;
            for (let i = 0; i < containers.length - 1; i++) {
                totalDistanceCalc += calculateDistance(
                    containers[i].latitude,
                    containers[i].longitude,
                    containers[i + 1].latitude,
                    containers[i + 1].longitude
                );
            }

            setTotalDistance(totalDistanceCalc);
            setEstimatedTime(estimateTime(totalDistanceCalc));
        }
    }, [routeOptimized, containers]);

    const routeDescription = routeOptimized
        ? `Optimized route with ${containers.length} collection points · Est. time: ${Math.floor(estimatedTime)}h ${Math.round((estimatedTime % 1) * 60)}m · Distance: ${totalDistance.toFixed(2)} km`
        : "Click 'Optimize Route' to start your collection journey!";

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto">
                {/* Mapa y Rutas - 8 columnas */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-md border-0 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-eco-lime/10 to-eco-emerald/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center text-2xl text-eco-forest">
                                        <MapPin className="h-6 w-6 mr-2 text-eco-emerald" />
                                        Collection Map
                                    </CardTitle>
                                    <CardDescription className="text-eco-forest/70">
                                        Navigate optimized waste collection routes in Medellín
                                    </CardDescription>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={routeOptimized ? "outline" : "default"}
                                            size="lg"
                                            className={`flex items-center transition-all duration-200 ${routeOptimized
                                                ? "bg-eco-emerald text-white hover:bg-eco-emerald-dark"
                                                : "bg-eco-forest text-white hover:bg-eco-forest-dark"
                                                }`}
                                            onClick={optimizeRoute}
                                        >
                                            <Navigation className="h-5 w-5 mr-2" />
                                            {routeOptimized ? "Route Optimized" : "Optimize Route"}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Generate the most efficient collection path
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {!mapLoaded ? (
                                <div className="flex items-center justify-center h-[500px] bg-eco-forest/5 rounded-lg">
                                    <div className="text-center space-y-4">
                                        <div className="animate-spin h-8 w-8 border-4 border-eco-emerald border-t-transparent rounded-full mx-auto"></div>
                                        <p className="text-eco-forest">Loading map...</p>
                                    </div>
                                </div>
                            ) : (
                                <LeafletMap
                                    showRoute={routeOptimized}
                                    selectedContainerId={selectedContainer}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                        <CardHeader className="bg-eco-forest/5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center text-2xl text-eco-forest">
                                        <Truck className="h-6 w-6 mr-2 text-eco-emerald" />
                                        Current Route
                                    </CardTitle>
                                    <CardDescription className="text-eco-forest/70">
                                        {routeDescription}
                                    </CardDescription>
                                </div>
                                {routeOptimized && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-eco-forest hover:bg-eco-forest/10"
                                            >
                                                Reset Routes
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reset Visited Routes?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will clear all visited routes and reset the route order. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={resetVisitedRoutes}>
                                                    Reset
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {routeOptimized ? (
                                orderedContainers.length > 0 ? (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        defaultValue={
                                            orderedContainers.length > 0 && !visitedRoutes.includes(orderedContainers[0].id)
                                                ? `container-${orderedContainers[0].id}`
                                                : undefined
                                        }
                                        className="space-y-3"
                                    >
                                        {orderedContainers.map((container, index) => {
                                            const isVisited = visitedRoutes.includes(container.id);
                                            return (
                                                <AccordionItem
                                                    key={container.id}
                                                    value={`container-${container.id}`}
                                                    className={`border rounded-lg shadow-sm transition-all duration-300 ${isVisited ? "bg-gray-50 opacity-80" : "bg-white"
                                                        }`}
                                                >
                                                    <AccordionTrigger
                                                        className={`px-4 py-3 rounded-t-lg hover:bg-eco-forest/5 ${isVisited ? "text-gray-600" : "text-eco-forest"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center w-full font-semibold">
                                                            <div className="flex items-center space-x-3 truncate">
                                                                <span
                                                                    className={`w-6 h-6 flex items-center justify-center rounded-full ${isVisited
                                                                        ? "bg-gray-200 text-gray-600"
                                                                        : "bg-eco-emerald text-white"
                                                                        }`}
                                                                >
                                                                    {index + 1}
                                                                </span>
                                                                {isVisited && (
                                                                    <CheckCircle className="h-5 w-5 text-gray-400" />
                                                                )}
                                                                <span>{container.address}</span>
                                                            </div>
                                                            <Badge className={`${statusColor(container.status)} font-medium`}>
                                                                {container.status}
                                                            </Badge>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent
                                                        className={`px-4 py-4 space-y-4 ${isVisited ? "text-gray-600" : "text-eco-forest"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {container.type}
                                                                </p>
                                                                <p className="text-sm">
                                                                    Weight: {container.estimatedWeight} kg
                                                                </p>
                                                            </div>
                                                        </div>
                                                        skateboarding dog
                                                        <div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Fill Level</span>
                                                                <span className="font-medium">
                                                                    {container.fillPercentage}%
                                                                </span>
                                                            </div>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Progress
                                                                        value={container.fillPercentage}
                                                                        className={`h-3 mt-1 ${isVisited ? "bg-gray-300" : "bg-eco-emerald/20"
                                                                            }`}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {container.fillPercentage}% Full
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        <Button
                                                            onClick={() => navigateTo(container)}
                                                            className={`w-full transition-all duration-200 ${isVisited
                                                                ? "bg-gray-300 hover:bg-gray-400 text-gray-700"
                                                                : "bg-eco-emerald hover:bg-eco-emerald-dark text-white"
                                                                }`}
                                                        >
                                                            <Navigation className="h-5 w-5 mr-2" />
                                                            Navigate
                                                        </Button>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                ) : (
                                    <div className="text-center text-eco-forest/60 italic">
                                        No collection points available. Try optimizing the route again.
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-eco-forest/60 italic">
                                    Optimize a route to view collection points.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - 4 columnas */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-md border-0 rounded-xl">
                        <CardHeader className="bg-eco-forest/5">
                            <CardTitle className="flex items-center text-2xl text-eco-forest">
                                <Layers className="h-6 w-6 mr-2 text-eco-emerald" />
                                Collection Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="fill" className="w-full">
                                <TabsList className="w-full justify-start bg-eco-forest/5">
                                    <TabsTrigger value="fill" className="text-sm">
                                        By Fill Level
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="fill" className="m-0">
                                    <div className="divide-y">
                                        {[...containers]
                                            .sort((a, b) => b.fillPercentage - a.fillPercentage)
                                            .map((container) => (
                                                <div
                                                    key={container.id}
                                                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-eco-forest/10 ${selectedContainer === container.id
                                                        ? "bg-eco-forest/10"
                                                        : ""
                                                        }`}
                                                    onClick={() => setSelectedContainer(container.id)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold text-eco-forest truncate max-w-[200px]">
                                                                {container.address}
                                                            </h4>
                                                            <p className="text-sm text-eco-forest/60">
                                                                {container.type} · Updated{" "}
                                                                {new Date(container.lastUpdated).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            className={`${statusColor(
                                                                container.status
                                                            )} flex items-center space-x-1`}
                                                        >
                                                            <Recycle className="h-4 w-4" />
                                                            <span>{container.fillPercentage}%</span>
                                                        </Badge>
                                                    </div>
                                                    <Progress
                                                        value={container.fillPercentage}
                                                        className="h-2 mt-2 bg-eco-emerald/20"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                        <CardHeader className="bg-eco-forest/5">
                            <CardTitle className="flex items-center text-2xl text-eco-forest">
                                <BarChart3 className="h-6 w-6 mr-2 text-eco-emerald" />
                                Collection Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-eco-forest/80 mb-2">
                                    Today's Collections
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-eco-forest/10 p-4 rounded-lg shadow-sm">
                                        <p className="text-xs text-eco-forest/60">Weight</p>
                                        <p className="text-lg font-bold text-eco-forest flex items-center">
                                            <Truck className="h-4 w-4 mr-2 text-eco-emerald" />
                                            {collectionStats.todayWeight} kg
                                        </p>
                                    </div>
                                    <div className="bg-eco-forest/10 p-4 rounded-lg shadow-sm">
                                        <p className="text-xs text-eco-forest/60">Containers</p>
                                        <p className="text-lg font-bold text-eco-forest flex items-center">
                                            <Layers className="h-4 w-4 mr-2 text-eco-emerald" />
                                            {collectionStats.todayContainers}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-eco-forest/80 mb-2">
                                    This Week
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-eco-forest/10 p-4 rounded-lg shadow-sm">
                                        <p className="text-xs text-eco-forest/60">Weight</p>
                                        <p className="text-lg font-bold text-eco-forest flex items-center">
                                            <Truck className="h-4 w-4 mr-2 text-eco-emerald" />
                                            {collectionStats.weekWeight} kg
                                        </p>
                                    </div>
                                    <div className="bg-eco-forest/10 p-4 rounded-lg shadow-sm">
                                        <p className="text-xs text-eco-forest/60">Containers</p>
                                        <p className="text-lg font-bold text-eco-forest flex items-center">
                                            <Layers className="h-4 w-4 mr-2 text-eco-emerald" />
                                            {collectionStats.weekContainers}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-eco-forest/80 mb-2">
                                    Carbon Saved (Monthly)
                                </p>
                                <div className="bg-gradient-to-r from-eco-lime/80 to-eco-emerald/80 p-4 rounded-lg text-white shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">CO₂ Equivalent</p>
                                        <p className="text-lg font-bold flex items-center">
                                            <Recycle className="h-5 w-5 mr-2" />
                                            {collectionStats.co2Saved} kg
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}