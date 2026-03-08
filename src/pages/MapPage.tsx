import { motion } from "framer-motion";
import MapView from "@/components/house/MapView";
import { mockHouses } from "@/data/mockHouses";

const MapPage = () => {
  const vacantHouses = mockHouses.filter((h) => h.status === "vacant");

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Map View</h1>
          <p className="text-muted-foreground">
            Explore {vacantHouses.length} available properties on the map
          </p>
        </motion.div>
        <MapView houses={vacantHouses} className="h-[calc(100vh-200px)]" />
      </div>
    </div>
  );
};

export default MapPage;
