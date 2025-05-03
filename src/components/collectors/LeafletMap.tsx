import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import "leaflet-routing-machine";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.Icon.extend({});
const defaultIcon = new DefaultIcon({
    iconUrl: icon,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const colombiaBounds = L.latLngBounds([-4.2, -79.5], [13.5, -66.8]);

interface LeafletMapProps {
    showRoute?: boolean;
    selectedContainerId?: number | null;
}

interface Container {
    id: number;
    name?: string;
    latitude: number;
    longitude: number;
    address: string;
    weight: number;
    volume: number;
}

export function LeafletMap({
    showRoute = false,
    selectedContainerId = null,
}: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);
    const [containers, setContainers] = useState<Container[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        if (!showRoute) {
            fetch("https://zyrcle-backend.diegormdev.site/api/rutas/quemadas")
                .then((res) => res.json())
                .then((data) => setContainers(data))
                .catch((err) => console.error("Error al obtener contenedores:", err));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setUserLocation(userLocation);

                    fetch("https://zyrcle-backend.diegormdev.site/api/rutas/optimizar", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(userLocation),
                    })
                        .then((res) => {
                            if (!res.ok) throw new Error("Error en el backend");
                            return res.json();
                        })
                        .then((data) => {
                            console.log(data);
                            setContainers(data)
                        }

                        )
                        .catch((err) => console.error("Error al obtener la ruta optimizada:", err));
                },
                (error) => {
                    console.error("No se pudo obtener la ubicación del usuario:", error);
                }
            );
        }
    }, [showRoute]);

    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current && containers.length > 0) {
            const mapCenter: [number, number] = [containers[0].latitude, containers[0].longitude];
            const map = L.map(mapRef.current).setView(mapCenter, 13);
            map.setMaxBounds(colombiaBounds);
            map.setMinZoom(6);
            map.on("drag", () => map.panInsideBounds(colombiaBounds, { animate: false }));

            const jawgLagoonLayer = L.tileLayer(
                'https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=ukQ7o1P66GDJoHfBJ42xX7Oe6AvwLpqv9qQAxWPqrMnqPAKmrni9vApSJstgctS3',
                {
                    attribution: '&copy; <a href="https://jawg.io" target="_blank"><b>Jawg</b> Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    minZoom: 0,
                    maxZoom: 22,
                }
            ).addTo(map);

            // Mostrar ubicación del usuario como el primer punto
            if (userLocation) {
                const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
                    icon: L.icon({
                        iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", // ícono azul personalizado
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                        popupAnchor: [0, -30],
                    }),
                }).addTo(map);
                userMarker.bindPopup("Tu ubicación").openPopup();

                // Centrar el mapa en la ubicación del usuario
                map.setView([userLocation.latitude, userLocation.longitude], 13);
            }

            // Mostrar contenedores
            containers.forEach((container) => {
                const marker = L.marker([container.latitude, container.longitude]).addTo(map);
                marker.bindPopup(`<b>${container.name ?? "Contenedor"}</b><br/>${container.address}`);
                if (selectedContainerId === container.id) marker.openPopup();
                marker.on("click", () => {
                    if (selectedContainerId !== container.id) {
                        // Realiza alguna acción específica si el contenedor no está seleccionado
                    }
                });
            });

            // Mostrar ruta si aplica
            if (showRoute) {
                const waypoints = [L.latLng(userLocation?.latitude ?? containers[0].latitude, userLocation?.longitude ?? containers[0].longitude), ...containers.map((c) => L.latLng(c.latitude, c.longitude))];

                // Eliminar rutas previas si existen
                if (leafletMapRef.current) {
                    leafletMapRef.current.eachLayer((layer) => {
                        if (layer instanceof L.Routing.Control) {
                            layer.remove();
                        }
                    });
                }
                const routeControl = L.Routing.control({
                    waypoints,
                    routeWhileDragging: false,
                    show: false,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    lineOptions: {
                        styles: [{ color: "#10B981", weight: 5, opacity: 0.8 }],
                    },
                    createMarker: function (i, wp, nWps) {
                        return L.marker(wp.latLng, {
                            icon: defaultIcon,
                        }).bindPopup(i === 0 ? "Inicio" : i === nWps - 1 ? "Destino" : `Punto ${i + 1}`);
                    },
                }).addTo(map);


                routeControl.getPlan().setWaypoints(waypoints);

                const routingContainer = document.querySelector(".leaflet-routing-container");
                if (routingContainer) routingContainer.remove();
            }

            leafletMapRef.current = map;
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [containers, showRoute, selectedContainerId, userLocation]);

    return (
        <Card className="p-0 overflow-hidden">
            <div ref={mapRef} style={{ height: "600px", width: "100%" }} className="z-0" />
        </Card>
    );
}
