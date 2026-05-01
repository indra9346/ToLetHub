import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Bed, Bath, Home, ChefHat, Phone, Mail,
  Heart, Share2, IndianRupee, Maximize, Calendar, CheckCircle, Loader2,
  Navigation, Play, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHouse } from "@/hooks/useHouses";
import MapView from "@/components/house/MapView";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: house, isLoading } = useHouse(id!);
  const [activeImg, setActiveImg] = useState(0);
  const { user } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFavMutation = useToggleFavorite();
  const isFav = favIds?.includes(id!) ?? false;

  const toggleFav = () => {
    if (!user) { toast.info("Sign in to save favorites"); return; }
    toggleFavMutation.mutate({ houseId: id!, isFav });
  };

  const handleConfirmAndNavigate = () => {
    if (!user) {
      toast.info("Sign in to confirm and navigate to this house");
      return;
    }
    toast.success("🏠 House confirmed! Starting live navigation...");
    navigate(`/map?navigate=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">House Not Found</h2>
          <Link to="/listings"><Button variant="outline">Back to Listings</Button></Link>
        </div>
      </div>
    );
  }

  const images = house.images?.length ? house.images : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"];
  const videos = (house as any).videos ?? [];

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 page-backdrop page-backdrop-listings">
      <div className="container mx-auto px-4 relative z-10">
        <Link to="/listings" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-xl overflow-hidden aspect-[16/10]">
              <img src={images[activeImg]} alt={house.title} className="w-full h-full object-cover" />
              <Badge className={`absolute top-4 left-4 ${house.status === "vacant" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                {house.status === "vacant" ? "Available" : "Occupied"}
              </Badge>
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" /> Property Videos
                </h3>
                <div className="grid gap-4">
                  {videos.map((videoUrl: string, i: number) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-secondary">
                      <video
                        controls
                        preload="metadata"
                        className="w-full max-h-[400px] rounded-xl"
                        poster=""
                      >
                        <source src={videoUrl} />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">{house.title}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />{house.address}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={toggleFav}>
                    <Heart className={`w-4 h-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex items-center text-primary font-display text-3xl font-bold mb-6">
                <IndianRupee className="w-6 h-6" />
                {Number(house.rent).toLocaleString("en-IN")}
                <span className="text-muted-foreground text-base font-normal ml-2">/month</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Bed, label: "Rooms", value: house.rooms },
                  { icon: Bath, label: "Bathrooms", value: house.bathrooms },
                  { icon: Maximize, label: "Area", value: house.area ? `${house.area} sq.ft` : "N/A" },
                  { icon: Calendar, label: "Listed", value: new Date(house.created_at).toLocaleDateString() },
                ].map((spec) => (
                  <div key={spec.label} className="glass rounded-xl p-4 text-center">
                    <spec.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="font-display font-semibold text-foreground">{spec.value}</div>
                    <div className="text-xs text-muted-foreground">{spec.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {house.has_hall && <Badge variant="secondary" className="gap-1"><Home className="w-3 h-3" /> Hall</Badge>}
                  {house.has_kitchen && <Badge variant="secondary" className="gap-1"><ChefHat className="w-3 h-3" /> Kitchen</Badge>}
                  {house.amenities?.map((a) => (
                    <Badge key={a} variant="secondary" className="gap-1"><CheckCircle className="w-3 h-3" /> {a}</Badge>
                  ))}
                </div>
              </div>

              {house.description && (
                <div className="mb-8">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{house.description}</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Confirm & Navigate CTA */}
            {house.status === "vacant" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <Button
                  onClick={handleConfirmAndNavigate}
                  size="lg"
                  className="w-full gap-2 text-base h-14 bg-gradient-to-r from-primary to-primary/80"
                >
                  <Navigation className="w-5 h-5" />
                  Confirm & Navigate to House
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Get live GPS directions to this property
                </p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-xl p-6 card-shadow sticky top-24">
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-4">Contact Owner</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {house.contact_name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-card-foreground">{house.contact_name}</div>
                    <div className="text-xs text-muted-foreground">Property Owner</div>
                  </div>
                </div>
                <a href={`tel:${house.contact_phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm text-secondary-foreground">{house.contact_phone}</span>
                </a>
                {house.contact_email && (
                  <a href={`mailto:${house.contact_email}`} className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm text-secondary-foreground">{house.contact_email}</span>
                  </a>
                )}
              </div>
              <a href={`tel:${house.contact_phone}`}>
                <Button className="w-full gap-2" size="lg"><Phone className="w-4 h-4" />Call Now</Button>
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">Location</h3>
              <MapView houses={[house as any]} center={[house.lat, house.lng]} zoom={15} singleMarker className="h-[300px]" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;