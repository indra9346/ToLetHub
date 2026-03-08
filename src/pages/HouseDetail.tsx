import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Bed, Bath, Home, ChefHat, Phone, Mail,
  Heart, Share2, IndianRupee, Maximize, Calendar, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockHouses } from "@/data/mockHouses";
import MapView from "@/components/house/MapView";
import { useState } from "react";

const HouseDetail = () => {
  const { id } = useParams();
  const house = mockHouses.find((h) => h.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favs.includes(id);
  });

  const toggleFav = () => {
    const favs: string[] = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = isFav ? favs.filter((f) => f !== id) : [...favs, id!];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFav(!isFav);
  };

  if (!house) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">House Not Found</h2>
          <Link to="/listings">
            <Button variant="outline">Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link to="/listings" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-xl overflow-hidden aspect-[16/10]"
            >
              <img
                src={house.images[activeImg]}
                alt={house.title}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-4 left-4 ${
                  house.status === "vacant"
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {house.status === "vacant" ? "Available" : "Occupied"}
              </Badge>
            </motion.div>

            {/* Thumbnails */}
            {house.images.length > 1 && (
              <div className="flex gap-2">
                {house.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">{house.title}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {house.address}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={toggleFav}>
                    <Heart className={`w-4 h-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-primary font-display text-3xl font-bold mb-6">
                <IndianRupee className="w-6 h-6" />
                {house.rent.toLocaleString("en-IN")}
                <span className="text-muted-foreground text-base font-normal ml-2">/month</span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Bed, label: "Rooms", value: house.rooms },
                  { icon: Bath, label: "Bathrooms", value: house.bathrooms },
                  { icon: Maximize, label: "Area", value: `${house.area} sq.ft` },
                  { icon: Calendar, label: "Listed", value: new Date(house.createdAt).toLocaleDateString() },
                ].map((spec) => (
                  <div key={spec.label} className="bg-secondary rounded-xl p-4 text-center">
                    <spec.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="font-display font-semibold text-foreground">{spec.value}</div>
                    <div className="text-xs text-muted-foreground">{spec.label}</div>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {house.hasHall && (
                    <Badge variant="secondary" className="gap-1">
                      <Home className="w-3 h-3" /> Hall
                    </Badge>
                  )}
                  {house.hasKitchen && (
                    <Badge variant="secondary" className="gap-1">
                      <ChefHat className="w-3 h-3" /> Kitchen
                    </Badge>
                  )}
                  {house.amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="gap-1">
                      <CheckCircle className="w-3 h-3" /> {a}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{house.description}</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Contact + Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 card-shadow sticky top-24"
            >
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Contact Owner</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {house.contactName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-card-foreground">{house.contactName}</div>
                    <div className="text-xs text-muted-foreground">Property Owner</div>
                  </div>
                </div>
                <a
                  href={`tel:${house.contactPhone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm text-secondary-foreground">{house.contactPhone}</span>
                </a>
                <a
                  href={`mailto:${house.contactEmail}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm text-secondary-foreground">{house.contactEmail}</span>
                </a>
              </div>
              <Button className="w-full gap-2" size="lg">
                <Phone className="w-4 h-4" />
                Call Now
              </Button>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">Location</h3>
              <MapView
                houses={[house]}
                center={[house.lat, house.lng]}
                zoom={15}
                singleMarker
                className="h-[300px]"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;
