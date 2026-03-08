import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { House } from "@/data/mockHouses";
import { Link } from "react-router-dom";
import { IndianRupee } from "lucide-react";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapViewProps {
  houses: House[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  singleMarker?: boolean;
}

const FitBounds = ({ houses }: { houses: House[] }) => {
  const map = useMap();
  useEffect(() => {
    if (houses.length > 0) {
      const bounds = L.latLngBounds(houses.map((h) => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [houses, map]);
  return null;
};

const MapView = ({
  houses,
  center = [12.9716, 77.5946],
  zoom = 12,
  className = "h-[400px]",
  singleMarker = false,
}: MapViewProps) => {
  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!singleMarker && <FitBounds houses={houses} />}
        {houses.map((house) => (
          <Marker key={house.id} position={[house.lat, house.lng]}>
            <Popup>
              <div className="min-w-[200px]">
                <img
                  src={house.images[0]}
                  alt={house.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{house.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{house.address}</p>
                <div className="flex items-center text-sm font-bold text-orange-500">
                  <IndianRupee className="w-3 h-3" />
                  {house.rent.toLocaleString("en-IN")}/mo
                </div>
                <Link
                  to={`/house/${house.id}`}
                  className="text-xs text-blue-600 underline mt-1 inline-block"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
