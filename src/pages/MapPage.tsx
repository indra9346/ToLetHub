import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import MapView from "@/components/house/MapView";
import { useHouses } from "@/hooks/useHouses";

const MapPage = () => {
  const { data: houses, isLoading } = useHouses({ status: "vacant" });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Map View</h1>
          <p className="text-muted-foreground">
            Explore {houses?.length ?? 0} available properties on the map
          </p>
        </motion.div>
        <MapView houses={(houses ?? []) as any} className="h-[calc(100vh-200px)]" />
      </div>
    </div>
  );
};

export default MapPage;
