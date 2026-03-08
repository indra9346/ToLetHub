import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { IndianRupee, Navigation, X, Clock, MapPin as MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDistanceKm } from "@/hooks/useGeolocation";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const houseIcon = L.divIcon({
  className: "house-marker",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#e8572a;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MapHouse {
  id: string;
  title: string;
  address: string;
  rent: number;
  lat: number;
  lng: number;
  rooms: number;
  images?: string[] | null;
}

interface LiveMapViewProps {
  houses: MapHouse[];
  userPosition: { lat: number; lng: number } | null;
  className?: string;
  selectedHouseId: string | null;
  onSelectHouse: (id: string | null) => void;
  routePoints: [number, number][] | null;
}

/** Follows user position on the map */
const FollowUser = ({ position, follow }: { position: [number, number]; follow: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (follow) {
      map.setView(position, Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [position, follow, map]);
  return null;
};

/** Fits route bounds */
const FitRoute = ({ route }: { route: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [route, map]);
  return null;
};

const LiveMapView = ({
  houses,
  userPosition,
  className = "h-[400px]",
  selectedHouseId,
  onSelectHouse,
  routePoints,
}: LiveMapViewProps) => {
  const [followUser, setFollowUser] = useState(true);
  const center: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [12.9716, 77.5946];

  return (
    <div className={`rounded-xl overflow-hidden border border-border relative ${className}`}>
      <MapContainer center={center} zoom={14} className="w-full h-full" scrollWheelZoom zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={30}
              pathOptions={{ fillColor: "#3b82f6", fillOpacity: 0.08, color: "#3b82f6", weight: 1.5, dashArray: "4" }}
            />
            <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-sm">📍 You are here</strong>
                </div>
              </Popup>
            </Marker>
            <FollowUser position={[userPosition.lat, userPosition.lng]} follow={followUser && !routePoints} />
          </>
        )}

        {/* Route line */}
        {routePoints && routePoints.length > 1 && (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#3b82f6", weight: 5, opacity: 0.8, dashArray: "10, 6" }}
            />
            <FitRoute route={routePoints} />
          </>
        )}

        {/* House markers */}
        {houses.map((house) => {
          const isSelected = house.id === selectedHouseId;
          return (
            <Marker key={house.id} position={[house.lat, house.lng]} icon={houseIcon}>
              <Popup>
                <div className="min-w-[220px]">
                  <img
                    src={house.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"}
                    alt={house.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm mb-1">{house.title}</h3>
                  <p className="text-xs mb-1" style={{ color: "#666" }}>{house.address}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm font-bold" style={{ color: "#e8572a" }}>
                      <span style={{ fontSize: "11px", marginRight: "2px" }}>₹</span>
                      {Number(house.rent).toLocaleString("en-IN")}/mo
                    </div>
                    <span className="text-xs" style={{ color: "#666" }}>{house.rooms} Room{house.rooms > 1 ? "s" : ""}</span>
                  </div>
                  {userPosition && (
                    <p className="text-xs mb-2" style={{ color: "#3b82f6" }}>
                      📍 {getDistanceKm(userPosition.lat, userPosition.lng, house.lat, house.lng).toFixed(1)} km away
                    </p>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onSelectHouse(house.id)}
                      className="flex-1 px-2 py-1.5 rounded text-xs font-medium text-white"
                      style={{ background: "#3b82f6" }}
                    >
                      🧭 Navigate Here
                    </button>
                    <Link
                      to={`/house/${house.id}`}
                      className="px-2 py-1.5 rounded text-xs font-medium border"
                      style={{ borderColor: "#ddd", color: "#333" }}
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Recenter button */}
      {userPosition && (
        <button
          onClick={() => setFollowUser(true)}
          className="absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          title="Center on my location"
        >
          <Navigation className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  );
};

export default LiveMapView;
