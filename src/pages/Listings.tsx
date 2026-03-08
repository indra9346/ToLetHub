import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import HouseCard from "@/components/house/HouseCard";
import { mockHouses } from "@/data/mockHouses";

const Listings = () => {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [rentRange, setRentRange] = useState([0, 60000]);
  const [rooms, setRooms] = useState("all");
  const [statusFilter, setStatusFilter] = useState("vacant");

  const filtered = useMemo(() => {
    return mockHouses.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.address.toLowerCase().includes(search.toLowerCase());
      const matchRent = h.rent >= rentRange[0] && h.rent <= rentRange[1];
      const matchRooms = rooms === "all" || h.rooms === parseInt(rooms);
      const matchStatus = statusFilter === "all" || h.status === statusFilter;
      return matchSearch && matchRent && matchRooms && matchStatus;
    });
  }, [search, rentRange, rooms, statusFilter]);

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Browse Rental Houses
          </h1>
          <p className="text-muted-foreground">
            {filtered.length} properties found
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl p-6 mb-6 card-shadow"
          >
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Rent Range: ₹{rentRange[0].toLocaleString()} - ₹{rentRange[1].toLocaleString()}
                </label>
                <Slider
                  min={0}
                  max={60000}
                  step={1000}
                  value={rentRange}
                  onValueChange={setRentRange}
                  className="mt-3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Rooms</label>
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="vacant">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-muted-foreground"
              onClick={() => {
                setRentRange([0, 60000]);
                setRooms("all");
                setStatusFilter("vacant");
                setSearch("");
              }}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Listings Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((house, i) => (
              <HouseCard key={house.id} house={house} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No properties found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
