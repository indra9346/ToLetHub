import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Heart, IndianRupee } from "lucide-react";
import { useState } from "react";
import type { House } from "@/data/mockHouses";
import { Badge } from "@/components/ui/badge";

interface HouseCardProps {
  house: House;
  index?: number;
}

const HouseCard = ({ house, index = 0 }: HouseCardProps) => {
  const [isFav, setIsFav] = useState(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favs.includes(house.id);
  });

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs: string[] = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = isFav ? favs.filter((f) => f !== house.id) : [...favs, house.id];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFav(!isFav);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/house/${house.id}`} className="group block">
        <div className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 group-hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={house.images[0]}
              alt={house.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <button
              onClick={toggleFav}
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
              <span>{house.area} sq.ft</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-primary font-display font-bold text-lg">
                <IndianRupee className="w-4 h-4" />
                {house.rent.toLocaleString("en-IN")}
                <span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HouseCard;
