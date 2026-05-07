import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Navigation, Plus, Minus, Layers, Maximize2, Minimize2 } from "lucide-react";
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
  html: `<div style="position:relative;width:20px;height:20px;"><div style="position:absolute;inset:-8px;border-radius:50%;background:hsl(var(--primary) / 0.25);animation:pulse 2s ease-out infinite;"></div><div style="position:relative;width:20px;height:20px;border-radius:50%;background:hsl(var(--primary));border:3px solid hsl(var(--foreground));box-shadow:0 0 12px hsl(var(--primary) / 0.7);"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const houseIcon = L.divIcon({
  className: "house-marker",
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--gradient-primary);border:2px solid hsl(var(--foreground));box-shadow:0 4px 12px hsl(var(--primary) / 0.5);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;">🏠</div></div>`,
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

const MapViewportFix = ({ hostRef }: { hostRef: RefObject<HTMLDivElement> }) => {
  const map = useMap();

  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
        // Force a real re-fetch of tiles for the new viewport.
        // invalidateSize alone does NOT request missing tiles on mobile
        // when the container grows after the initial sizing — re-applying
        // the view nudges Leaflet to load tiles for the full bounds.
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

    // Multiple staggered refreshes to handle mobile address bar resize,
    // lazy mount, font/image reflows, and orientation changes.
    const timers = [0, 60, 200, 500, 1000, 1800].map((d) => window.setTimeout(refresh, d));
    map.whenReady(refresh);
    window.addEventListener("orientationchange", refresh);
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      observer?.disconnect();
      window.removeEventListener("orientationchange", refresh);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [hostRef, map]);

  return null;
};

const MapRefBinder = ({ mapRef }: { mapRef: MutableRefObject<L.Map | null> }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    return () => {
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef]);

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
  const [satellite, setSatellite] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const center: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [12.9716, 77.5946];

  // Lock body scroll when fullscreen + ESC to exit
  useEffect(() => {
    const refreshMap = () => {
      mapRef.current?.invalidateSize({ animate: false, pan: false });
      mapRef.current?.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) layer.redraw();
      });
    };
    const timers = [80, 280, 700].map((delay) => window.setTimeout(refreshMap, delay));
    if (!fullscreen) return () => timers.forEach(window.clearTimeout);
    const prev = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("map-fullscreen-active");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(window.clearTimeout);
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = prevHtml;
      document.body.classList.remove("map-fullscreen-active");
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.invalidateSize({ animate: false, pan: false });
      mapRef.current?.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) layer.redraw();
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [satellite]);

  return (
    <div
      ref={hostRef}
      className={`tolethub-map-shell overflow-hidden isolate bg-secondary ${
        fullscreen
          ? "fixed inset-0 z-[2000] h-[100dvh] w-screen rounded-none bg-background"
          : `relative rounded-2xl ${className}`
      }`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <MapContainer
        center={center}
        zoom={14}
        minZoom={3}
        maxZoom={19}
        className="w-full h-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        zoomSnap={0.5}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={80}
        worldCopyJump
      >
        <MapViewportFix hostRef={hostRef} />
        <MapRefBinder mapRef={mapRef} />
        {satellite ? (
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            keepBuffer={6}
            updateWhenIdle={false}
            updateWhenZooming={true}
            crossOrigin
          />
        ) : (
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            keepBuffer={6}
            updateWhenIdle={false}
            updateWhenZooming={true}
            crossOrigin
          />
        )}

        {/* User location */}
        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={30}
              pathOptions={{ fillColor: "hsl(var(--primary))", fillOpacity: 0.08, color: "hsl(var(--primary))", weight: 1.5, dashArray: "4" }}
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
              pathOptions={{ color: "hsl(var(--primary))", weight: 5, opacity: 0.8, dashArray: "10, 6" }}
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
                  <p className="text-xs mb-1 text-muted-foreground">{house.address}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm font-bold text-primary">
                      <span style={{ fontSize: "11px", marginRight: "2px" }}>₹</span>
                      {Number(house.rent).toLocaleString("en-IN")}/mo
                    </div>
                    <span className="text-xs text-muted-foreground">{house.rooms} Room{house.rooms > 1 ? "s" : ""}</span>
                  </div>
                  {userPosition && (
                    <p className="text-xs mb-2 text-primary">
                      📍 {getDistanceKm(userPosition.lat, userPosition.lng, house.lat, house.lng).toFixed(1)} km away
                    </p>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onSelectHouse(house.id)}
                      className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground"
                    >
                      🧭 Navigate Here
                    </button>
                    <Link
                      to={`/house/${house.id}`}
                      className="px-2 py-1.5 rounded text-xs font-medium border border-border text-foreground"
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

      {/* Google-Maps style control stack — top-right */}
      <div className={`absolute right-3 z-[1000] flex flex-col gap-2 ${fullscreen ? "top-6" : "top-3"}`}>
        <div className="glass-strong rounded-xl overflow-hidden flex flex-col">
          <button
            onClick={() => mapRef.current?.zoomIn(1, { animate: true })}
            className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-border/50" />
          <button
            onClick={() => mapRef.current?.zoomOut(1, { animate: true })}
            className="w-10 h-10 flex items-center justify-center hover:bg-primary/20 text-foreground transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setSatellite((s) => !s)}
          className="glass-strong rounded-xl w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          title={satellite ? "Switch to map" : "Switch to satellite"}
          aria-label={satellite ? "Switch to map view" : "Switch to satellite view"}
        >
          <Layers className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="glass-strong rounded-xl w-10 h-10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          title={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
          aria-label={fullscreen ? "Exit fullscreen map" : "Open fullscreen map"}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4 text-foreground" /> : <Maximize2 className="w-4 h-4 text-foreground" />}
        </button>
      </div>

      {/* Recenter — bottom-right */}
      {userPosition && (
        <button
          onClick={() => setFollowUser(true)}
          className={`absolute right-4 z-[1000] w-11 h-11 rounded-full glass-strong flex items-center justify-center hover:glow-primary transition-all ${
            fullscreen ? "bottom-8" : "bottom-4"
          }`}
          title="Center on my location"
          aria-label="Center map on my location"
        >
          <Navigation className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  );
};

export default LiveMapView;
