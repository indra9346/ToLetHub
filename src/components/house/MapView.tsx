import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { IndianRupee } from "lucide-react";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapHouse {
  id: string;
  title: string;
  address: string;
  rent: number;
  lat: number;
  lng: number;
  images?: string[] | null;
}

interface MapViewProps {
  houses: MapHouse[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  singleMarker?: boolean;
}

const FitBounds = ({ houses }: { houses: MapHouse[] }) => {
  const map = useMap();
  useEffect(() => {
    if (houses.length > 0) {
      const bounds = L.latLngBounds(houses.map((h) => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [houses, map]);
  return null;
};

const MapView = ({ houses, center = [12.9716, 77.5946], zoom = 12, className = "h-[400px]", singleMarker = false }: MapViewProps) => {
  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer center={center} zoom={zoom} className="w-full h-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!singleMarker && houses.length > 1 && <FitBounds houses={houses} />}
        {houses.map((house) => (
          <Marker key={house.id} position={[house.lat, house.lng]}>
            <Popup>
              <div className="min-w-[200px]">
                <img
                  src={house.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"}
                  alt={house.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{house.title}</h3>
                <p className="text-xs mb-1" style={{ color: "#666" }}>{house.address}</p>
                <div className="flex items-center text-sm font-bold" style={{ color: "#e8572a" }}>
                  <IndianRupee className="w-3 h-3" />
                  {Number(house.rent).toLocaleString("en-IN")}/mo
                </div>
                <Link to={`/house/${house.id}`} className="text-xs underline mt-1 inline-block" style={{ color: "#3b82f6" }}>
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
