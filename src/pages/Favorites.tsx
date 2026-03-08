import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HouseCard from "@/components/house/HouseCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

const Favorites = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useFavorites();

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">Sign in to see favorites</h3>
          <p className="text-muted-foreground mb-6">Create an account to save your favorite properties.</p>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const favHouses = favorites?.map((f: any) => f.houses).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Saved Properties</h1>
          <p className="text-muted-foreground">{favHouses.length} saved {favHouses.length === 1 ? "property" : "properties"}</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favHouses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favHouses.map((house: any, i: number) => (
              <HouseCard key={house.id} house={house} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground mb-6">Browse listings and tap the heart icon to save your favorites.</p>
            <Link to="/listings"><Button>Browse Properties</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
