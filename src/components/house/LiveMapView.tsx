import { useEffect, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  Navigation,
  Plus,
  Minus,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Link } from "react-router-dom";

import { getDistanceKm } from "@/hooks/useGeolocation";

/* ---------------- LEAFLET FIX ---------------- */

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ---------------- USER ICON ---------------- */

const userIcon = L.divIcon({
  className: "user-location-marker",

  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;
        inset:-10px;
        border-radius:50%;
        background:#00ffd5;
        opacity:.25;
        animation:pulse 2s infinite;
      "></div>

      <div style="
        width:20px;
        height:20px;
        border-radius:50%;
        background:#00ffd5;
        border:3px solid white;
        box-shadow:0 0 15px #00ffd5;
      "></div>
    </div>
  `,

  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* ---------------- HOUSE ICON ---------------- */

const houseIcon = L.divIcon({
  className: "house-marker",

  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#00ffd5;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:16px;
      border:2px solid white;
      box-shadow:0 0 12px rgba(0,255,213,.6);
    ">
      🏠
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

/* ---------------- FOLLOW USER ---------------- */

const FollowUser = ({
  position,
  follow,
}: {
  position: [number, number];
  follow: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!follow) return;

    map.flyTo(position, 16, {
      animate: true,
      duration: 1.5,
    });
  }, [position, follow, map]);

  return null;
};

/* ---------------- FIT ROUTE ---------------- */

const FitRoute = ({
  route,
}: {
  route: [number, number][];
}) => {
  const map = useMap();

  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(route, {
        padding: [50, 50],
      });
    }
  }, [route, map]);

  return null;
};

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

interface Props {
  houses: MapHouse[];

  userPosition: {
    lat: number;
    lng: number;
  } | null;

  className?: string;

  selectedHouseId: string | null;

  onSelectHouse: (id: string | null) => void;

  routePoints: [number, number][] | null;
}

const LiveMapView = ({
  houses,
  userPosition,
  className = "h-[500px]",
  selectedHouseId,
  onSelectHouse,
  routePoints,
}: Props) => {
  const mapRef = useRef<L.Map | null>(null);

  const [satellite, setSatellite] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);

  const [followUser, setFollowUser] = useState(true);

  const center: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [12.9716, 77.5946];

  /* ---------------- RESIZE FIX ---------------- */

  useEffect(() => {
    const timers = [300, 700, 1200].map((delay) =>
      setTimeout(() => {
        mapRef.current?.invalidateSize();

        mapRef.current?.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw();
          }
        });
      }, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [fullscreen, satellite]);

  /* ---------------- FULLSCREEN BODY FIX ---------------- */

  useEffect(() => {
    if (fullscreen) {
      document.body.classList.add("map-fullscreen-active");
    } else {
      document.body.classList.remove("map-fullscreen-active");
    }

    return () => {
      document.body.classList.remove("map-fullscreen-active");
    };
  }, [fullscreen]);

  return (
    <div
      className={`
        relative overflow-hidden bg-secondary rounded-2xl
        tolethub-map-shell

        ${
          fullscreen
            ? "fixed inset-0 z-[9999] h-[100dvh] w-screen rounded-none"
            : className
        }
      `}
    >
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
        preferCanvas
        className="w-full h-full"
        ref={mapRef}
      >
        {satellite ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            detectRetina
            keepBuffer={8}
            updateWhenIdle={false}
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            detectRetina
            keepBuffer={8}
            updateWhenIdle={false}
          />
        )}

        {/* USER */}

        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={100}
              pathOptions={{
                color: "#00ffd5",
                fillColor: "#00ffd5",
                fillOpacity: 0.1,
              }}
            />

            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>

            <FollowUser
              position={[userPosition.lat, userPosition.lng]}
              follow={followUser}
            />
          </>
        )}

        {/* ROUTE */}

        {routePoints && routePoints.length > 1 && (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: "#00ffd5",
                weight: 5,
              }}
            />

            <FitRoute route={routePoints} />
          </>
        )}

        {/* HOUSES */}

        {houses.map((house) => (
          <Marker
            key={house.id}
            position={[house.lat, house.lng]}
            icon={houseIcon}
          >
            <Popup>
              <div className="min-w-[220px]">
                <img
                  src={
                    house.images?.[0] ||
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
                  }
                  alt={house.title}
                  className="w-full h-24 object-cover rounded mb-2"
                />

                <h3 className="font-semibold text-sm">
                  {house.title}
                </h3>

                <p className="text-xs text-gray-500 mb-2">
                  {house.address}
                </p>

                <div className="font-bold text-primary mb-2">
                  ₹{house.rent.toLocaleString("en-IN")}
                </div>

                {userPosition && (
                  <div className="text-xs text-primary mb-2">
                    {getDistanceKm(
                      userPosition.lat,
                      userPosition.lng,
                      house.lat,
                      house.lng
                    ).toFixed(1)}{" "}
                    km away
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectHouse(house.id)}
                    className="flex-1 bg-primary text-black text-xs py-2 rounded"
                  >
                    Navigate
                  </button>

                  <Link
                    to={`/house/${house.id}`}
                    className="border px-2 py-2 rounded text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CONTROLS */}

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="rounded-xl overflow-hidden bg-black/70 backdrop-blur">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-11 h-11 flex items-center justify-center text-white"
          >
            <Plus size={18} />
          </button>

          <div className="h-px bg-white/10" />

          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-11 h-11 flex items-center justify-center text-white"
          >
            <Minus size={18} />
          </button>
        </div>

        <button
          onClick={() => setSatellite(!satellite)}
          className="w-11 h-11 rounded-xl bg-black/70 backdrop-blur flex items-center justify-center text-white"
        >
          <Layers size={18} />
        </button>

        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="w-11 h-11 rounded-xl bg-black/70 backdrop-blur flex items-center justify-center text-white"
        >
          {fullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
      </div>

      {/* RECENTER */}

      {userPosition && (
        <button
          onClick={() => {
            setFollowUser(true);

            mapRef.current?.flyTo(
              [userPosition.lat, userPosition.lng],
              16
            );
          }}
          className="
            absolute bottom-5 right-5 z-[1000]
            w-12 h-12 rounded-full
            bg-black/70 backdrop-blur
            flex items-center justify-center
          "
        >
          <Navigation className="text-primary w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default LiveMapView;