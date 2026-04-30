import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Heart, IndianRupee, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { House } from "@/hooks/useHouses";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";

interface HouseCardProps {
  house: House;
  index?: number;
}

const HouseCard = ({ house, index = 0 }: HouseCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = favIds?.includes(house.id) ?? false;

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Sign in to save favorites");
      return;
    }
    toggleFav.mutate({ houseId: house.id, isFav });
  };

  const imageUrl = house.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/house/${house.id}`} className="group block">
        <div className="glass rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-500 group-hover:-translate-y-2 group-hover:glow-primary">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={house.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <button
              onClick={handleToggleFav}
              className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center transition-transform hover:scale-110"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </button>
            <Badge
              className={`absolute top-3 left-3 ${
                house.status === "vacant"
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {house.status === "vacant" ? "Available" : "Occupied"}
            </Badge>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{house.address}</span>
            </div>
            <h3 className="font-display font-semibold text-card-foreground line-clamp-1 mb-2">
              {house.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" /> {house.rooms} {house.rooms === 1 ? "Room" : "Rooms"}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" /> {house.bathrooms} Bath
              </span>
              {house.area && <span>{house.area} sq.ft</span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-primary font-display font-bold text-lg">
                <IndianRupee className="w-4 h-4" />
                {Number(house.rent).toLocaleString("en-IN")}
                <span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
              </div>
              {house.status === "vacant" && (
                <Button
                  size="sm"
                  className="gap-1 text-xs h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) {
                      toast.info("Sign in to navigate to this house");
                      return;
                    }
                    toast.success("🏠 Starting navigation...");
                    navigate(`/map?navigate=${house.id}`);
                  }}
                >
                  <Navigation className="w-3 h-3" /> Visit
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HouseCard;
