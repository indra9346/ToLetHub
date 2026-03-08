import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Loader2, LocateFixed, Navigation, X, MapPin, IndianRupee,
  Bed, ArrowRight, Route, Clock, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveMapView from "@/components/house/LiveMapView";
import { useHouses, type House } from "@/hooks/useHouses";
import { useGeolocation, getDistanceKm } from "@/hooks/useGeolocation";
import { toast } from "sonner";

interface NearbyHouse extends House {
  distance: number;
}

const MapPage = () => {
  const { data: houses, isLoading } = useHouses({ status: "vacant" });
  const geo = useGeolocation();
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [navigatingToHouse, setNavigatingToHouse] = useState<NearbyHouse | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [showNearby, setShowNearby] = useState(true);

  // Start tracking on mount
  useEffect(() => {
    geo.startTracking();
    return () => geo.stopTracking();
  }, []);

  // Calculate nearby houses sorted by distance
  const nearbyHouses = useMemo<NearbyHouse[]>(() => {
    if (!geo.position || !houses) return [];
    return houses
      .map((h) => ({
        ...h,
        distance: getDistanceKm(geo.position!.lat, geo.position!.lng, h.lat, h.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }, [geo.position, houses]);

  // Fetch route using OSRM (free, no API key needed)
  const fetchRoute = useCallback(
    async (destLat: number, destLng: number) => {
      if (!geo.position) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${geo.position.lng},${geo.position.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRoutePoints(coords);
          const distKm = (route.distance / 1000).toFixed(1);
          const durMin = Math.ceil(route.duration / 60);
          setRouteInfo({
            distance: `${distKm} km`,
            duration: durMin < 60 ? `${durMin} min` : `${Math.floor(durMin / 60)}h ${durMin % 60}m`,
          });
        }
      } catch {
        toast.error("Could not fetch route. Try again later.");
      }
    },
    [geo.position]
  );

  const handleNavigate = useCallback(
    (house: NearbyHouse) => {
      setNavigatingToHouse(house);
      setSelectedHouseId(house.id);
      setShowNearby(false);
      fetchRoute(house.lat, house.lng);
      toast.success(`Navigating to ${house.title}`);
    },
    [fetchRoute]
  );

  const cancelNavigation = () => {
    setNavigatingToHouse(null);
    setSelectedHouseId(null);
    setRoutePoints(null);
    setRouteInfo(null);
    setShowNearby(true);
  };

  // Update route as user moves
  useEffect(() => {
    if (navigatingToHouse && geo.position) {
      const dist = getDistanceKm(
        geo.position.lat, geo.position.lng,
        navigatingToHouse.lat, navigatingToHouse.lng
      );
      // Refresh route every position update
      if (dist > 0.05) {
        fetchRoute(navigatingToHouse.lat, navigatingToHouse.lng);
      } else {
        toast.success("🎉 You've arrived at the destination!");
        cancelNavigation();
      }
    }
  }, [geo.position?.lat, geo.position?.lng]);

  // Don't block rendering on loading - show map with available data

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">Live Map</h1>
              <p className="text-muted-foreground text-sm">
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading houses...
                  </span>
                ) : geo.isTracking ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Live tracking · {nearbyHouses.length} houses nearby
                    {!navigator.onLine && " · Offline mode"}
                  </span>
                ) : geo.loading ? (
                  "Getting your location..."
                ) : (
                  `${houses?.length ?? 0} available properties`
                )}
              </p>
            </div>
            {!geo.isTracking && !geo.loading && (
              <Button onClick={geo.startTracking} className="gap-2">
                <LocateFixed className="w-4 h-4" /> Enable Location
              </Button>
            )}
          </div>
          {geo.error && geo.position === null && (
            <div className="mt-2 p-3 rounded-lg bg-warning/10 text-warning text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" /> {geo.error}
              </span>
              <Button variant="ghost" size="sm" onClick={geo.startTracking} className="text-xs shrink-0">Retry</Button>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <LiveMapView
              houses={(houses ?? []) as any}
              userPosition={geo.position}
              className="h-[calc(100vh-200px)]"
              selectedHouseId={selectedHouseId}
              onSelectHouse={(id) => {
                if (id && geo.position) {
                  const house = nearbyHouses.find((h) => h.id === id);
                  if (house) handleNavigate(house);
                  else {
                    const h = houses?.find((h) => h.id === id);
                    if (h) {
                      const nh: NearbyHouse = {
                        ...h,
                        distance: getDistanceKm(geo.position.lat, geo.position.lng, h.lat, h.lng),
                      };
                      handleNavigate(nh);
                    }
                  }
                }
              }}
              routePoints={routePoints}
            />

            {/* Navigation bar */}
            <AnimatePresence>
              {navigatingToHouse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-3 bg-card rounded-xl p-4 card-shadow flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground truncate text-sm">
                      {navigatingToHouse.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {routeInfo && (
                        <>
                          <span className="flex items-center gap-1"><Route className="w-3 h-3" />{routeInfo.distance}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{routeInfo.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to={`/house/${navigatingToHouse.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={cancelNavigation} className="shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nearby houses sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {showNearby && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Compass className="w-4 h-4 text-primary" />
                      {geo.position ? "Nearby Houses" : "All Houses"}
                    </h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                    {(geo.position ? nearbyHouses : (houses ?? []).map(h => ({ ...h, distance: 0 }))).map((house: any, i: number) => (
                      <motion.div
                        key={house.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-card rounded-xl p-3 card-shadow cursor-pointer transition-all hover:card-shadow-hover ${
                          selectedHouseId === house.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedHouseId(house.id)}
                      >
                        <div className="flex gap-3">
                          <img
                            src={house.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200"}
                            alt={house.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-card-foreground text-sm truncate">
                              {house.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" /> {house.address}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center text-primary font-semibold text-xs">
                                <IndianRupee className="w-3 h-3" />
                                {Number(house.rent).toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Bed className="w-3 h-3" /> {house.rooms}R
                              </span>
                              {house.distance > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {house.distance < 1
                                    ? `${(house.distance * 1000).toFixed(0)}m`
                                    : `${house.distance.toFixed(1)}km`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {geo.position && (
                          <Button
                            size="sm"
                            className="w-full mt-2 gap-1 text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(house as NearbyHouse);
                            }}
                          >
                            <Navigation className="w-3 h-3" /> Navigate
                            <ArrowRight className="w-3 h-3 ml-auto" />
                          </Button>
                        )}
                      </motion.div>
                    ))}

                    {nearbyHouses.length === 0 && geo.position && (
                      <div className="text-center py-8">
                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No houses found nearby</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {!showNearby && navigatingToHouse && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card rounded-xl p-4 card-shadow space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-foreground text-sm">Navigating to</h2>
                    <Button variant="ghost" size="sm" onClick={cancelNavigation} className="text-xs gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>

                  <img
                    src={navigatingToHouse.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"}
                    alt={navigatingToHouse.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  <div>
                    <h3 className="font-display font-semibold text-card-foreground">
                      {navigatingToHouse.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {navigatingToHouse.address}
                    </p>
                  </div>

                  {routeInfo && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary rounded-lg p-3 text-center">
                        <Route className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <div className="font-display font-semibold text-foreground text-sm">{routeInfo.distance}</div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                      <div className="bg-secondary rounded-lg p-3 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <div className="font-display font-semibold text-foreground text-sm">{routeInfo.duration}</div>
                        <div className="text-xs text-muted-foreground">ETA</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-primary font-display font-bold text-lg">
                    <IndianRupee className="w-4 h-4" />
                    {Number(navigatingToHouse.rent).toLocaleString("en-IN")}
                    <span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/house/${navigatingToHouse.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">View Full Details</Button>
                    </Link>
                  </div>

                  <Button variant="ghost" className="w-full text-xs gap-1" onClick={() => { cancelNavigation(); }}>
                    <ArrowRight className="w-3 h-3" /> Show all nearby houses
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
