import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, MapPin, Loader2, Globe2, Navigation2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import HouseCard from "@/components/house/HouseCard";
import { useHouses } from "@/hooks/useHouses";
import { useGeolocation, getDistanceKm } from "@/hooks/useGeolocation";
import { toast } from "sonner";

interface GeoCenter {
  lat: number;
  lng: number;
  label: string;
}

const Listings = () => {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [rentRange, setRentRange] = useState([0, 100000]);
  const [rooms, setRooms] = useState("all");
  const [statusFilter, setStatusFilter] = useState("vacant");
  const [cityQuery, setCityQuery] = useState("");
  const [geoCenter, setGeoCenter] = useState<GeoCenter | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [geocoding, setGeocoding] = useState(false);
  const { position, startTracking } = useGeolocation();

  const { data: houses, isLoading } = useHouses({
    search: search || undefined,
    minRent: rentRange[0] || undefined,
    maxRent: rentRange[1] < 100000 ? rentRange[1] : undefined,
    rooms: rooms !== "all" ? parseInt(rooms) : undefined,
    status: statusFilter,
  });

  // Active center: explicit city search > device GPS
  const activeCenter: GeoCenter | null = geoCenter
    ? geoCenter
    : position
    ? { lat: position.lat, lng: position.lng, label: "Your location" }
    : null;

  // Sort by distance when we have a center
  const sortedHouses = useMemo(() => {
    if (!houses) return [];
    if (!activeCenter) return houses;
    return [...houses]
      .map((h) => ({
        h,
        dist: getDistanceKm(activeCenter.lat, activeCenter.lng, h.lat, h.lng),
      }))
      .sort((a, b) => a.dist - b.dist)
      .map((x) => x.h);
  }, [houses, activeCenter]);

  const nearbyHouses = useMemo(() => {
    if (!activeCenter) return sortedHouses;
    return sortedHouses.filter(
      (h) => getDistanceKm(activeCenter.lat, activeCenter.lng, h.lat, h.lng) <= radiusKm
    );
  }, [sortedHouses, activeCenter, radiusKm]);

  const showNearbyEmpty = !!activeCenter && !isLoading && nearbyHouses.length === 0 && (houses?.length ?? 0) > 0;

  const handleCitySearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = cityQuery.trim();
    if (!q) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("Couldn't find that location. Try a different city or country.");
        return;
      }
      const r = data[0];
      setGeoCenter({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        label: r.display_name?.split(",").slice(0, 2).join(", ") || q,
      });
      toast.success(`Showing listings near ${q}`);
    } catch {
      toast.error("Location search failed. Check your connection.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleUseMyLocation = () => {
    setGeoCenter(null);
    setCityQuery("");
    startTracking();
    toast.info("Using your device location");
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 page-backdrop page-backdrop-listings">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Browse Rental Houses</h1>
          <p className="text-muted-foreground">
            {activeCenter
              ? `${nearbyHouses.length} of ${houses?.length ?? 0} within ${radiusKm} km of ${activeCenter.label}`
              : `${houses?.length ?? 0} properties found`}
          </p>
        </motion.div>

        {/* City / country fallback search */}
        <form onSubmit={handleCitySearch} className="glass-strong rounded-xl p-4 mb-4 card-shadow flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or country (e.g. Singapore, Mumbai, London)"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={geocoding || !cityQuery.trim()} className="gap-2">
              {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Area
            </Button>
            <Button type="button" variant="outline" onClick={handleUseMyLocation} className="gap-2">
              <Navigation2 className="w-4 h-4" />
              <span className="hidden sm:inline">My Location</span>
            </Button>
          </div>
        </form>

        {activeCenter && (
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
            <span className="text-muted-foreground">
              📍 Centered on <strong className="text-foreground">{activeCenter.label}</strong>
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <span className="text-muted-foreground whitespace-nowrap">Radius: {radiusKm} km</span>
              <Slider min={5} max={500} step={5} value={[radiusKm]} onValueChange={(v) => setRadiusKm(v[0])} />
            </div>
            {geoCenter && (
              <Button variant="ghost" size="sm" onClick={() => setGeoCenter(null)} className="text-muted-foreground">
                <X className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by title or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-strong rounded-xl p-6 mb-6 card-shadow">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Rent Range: ₹{rentRange[0].toLocaleString()} - ₹{rentRange[1].toLocaleString()}
                </label>
                <Slider min={0} max={100000} step={1000} value={rentRange} onValueChange={setRentRange} className="mt-3" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Rooms</label>
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3">3 Rooms</SelectItem>
                    <SelectItem value="4">4+ Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="vacant">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-4 text-muted-foreground" onClick={() => { setRentRange([0, 100000]); setRooms("all"); setStatusFilter("vacant"); setSearch(""); }}>
              <X className="w-3.5 h-3.5 mr-1" /> Clear Filters
            </Button>
          </motion.div>
        )}

        {isLoading && !houses ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : showNearbyEmpty ? (
          <div className="text-center py-16 bg-card rounded-xl card-shadow">
            <Globe2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No listings within {radiusKm} km of {activeCenter?.label}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try expanding the radius, searching a different city, or browse all available listings worldwide.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setRadiusKm(Math.min(500, radiusKm * 2))} variant="outline">
                Expand to {Math.min(500, radiusKm * 2)} km
              </Button>
              <Button onClick={() => { setGeoCenter(null); setCityQuery(""); }}>
                Show All Listings
              </Button>
            </div>
          </div>
        ) : nearbyHouses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyHouses.map((house, i) => (
              <HouseCard key={house.id} house={house} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
