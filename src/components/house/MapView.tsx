import { useEffect, useRef, useState, type RefObject } from "react";
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

const MapViewportFix = ({ hostRef }: { hostRef: RefObject<HTMLDivElement> }) => {
  const map = useMap();
  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
        const c = map.getCenter();
        const z = map.getZoom();
        map.setView(c, z, { animate: false });
        map.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) layer.redraw();
        });
      });
    };
    const host = hostRef.current;
    const observer = host ? new ResizeObserver(refresh) : null;
    if (host && observer) observer.observe(host);
    const timers = [0, 80, 240, 650, 1200].map((delay) => window.setTimeout(refresh, delay));
    map.whenReady(refresh);
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      observer?.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [hostRef, map]);
  return null;
};

const useStableMapHost = (hostRef: RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [hostRef]);

  return {
    ready: size.width >= 280 && size.height >= 300,
    key: `${size.width}x${size.height}`,
  };
};

const MapView = ({ houses, center = [12.9716, 77.5946], zoom = 12, className = "h-[400px]", singleMarker = false }: MapViewProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { ready: mapReady, key: mapSizeKey } = useStableMapHost(hostRef);

  return (
    <div ref={hostRef} className={`tolethub-map-shell rounded-xl overflow-hidden border border-border bg-secondary ${className}`}>
      {mapReady ? (
      <MapContainer key={mapSizeKey} center={center} zoom={zoom} className="w-full h-full" scrollWheelZoom zoomControl={false} attributionControl={false} preferCanvas>
        <MapViewportFix hostRef={hostRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={6}
          updateWhenIdle={false}
          updateWhenZooming={true}
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
                <p className="text-xs mb-1 text-muted-foreground">{house.address}</p>
                <div className="flex items-center text-sm font-bold text-primary">
                  <IndianRupee className="w-3 h-3" />
                  {Number(house.rent).toLocaleString("en-IN")}/mo
                </div>
                <Link to={`/house/${house.id}`} className="text-xs underline mt-1 inline-block text-primary">
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      ) : (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center text-sm text-muted-foreground">
          Loading map…
        </div>
      )}
    </div>
  );
};

export default MapView;
