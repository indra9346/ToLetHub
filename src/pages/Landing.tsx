import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-building.jpg";
import HouseCard from "@/components/house/HouseCard";
import { useHouses } from "@/hooks/useHouses";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Search, title: "Smart Search", desc: "Find your perfect home with powerful filters for rent, location, rooms, and amenities." },
  { icon: MapPin, title: "Live Map View", desc: "See all available houses on an interactive map with real-time location data." },
  { icon: Shield, title: "Verified Listings", desc: "Every property is verified by owners with genuine photos and accurate details." },
  { icon: Zap, title: "Works Offline", desc: "Browse cached listings even without internet. Data syncs automatically when you reconnect." },
];

const Landing = () => {
  const { data: houses } = useHouses({ status: "vacant" });
  const featured = (houses ?? []).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Modern apartment building" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-85" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm mb-6" style={{ color: "hsl(220 10% 80%)" }}>
              <Zap className="w-3.5 h-3.5" /> Now with offline support
            </motion.div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: "hsl(0 0% 100%)" }}>
              Find Your Perfect<br /><span className="text-gradient">Rental Home</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ color: "hsl(220 10% 80%)" }}>
              Discover thousands of verified rental properties on an interactive map. Browse, filter, and connect with owners — even offline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/listings"><Button size="lg" className="text-base px-8 gap-2"><Search className="w-5 h-5" />Browse Houses</Button></Link>
              <Link to="/map"><Button size="lg" variant="outline" className="text-base px-8 gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"><MapPin className="w-5 h-5" />View on Map</Button></Link>
            </div>
            <div className="flex gap-8 mt-12">
              {[{ label: "Properties", value: "1,200+" }, { label: "Cities", value: "25+" }, { label: "Happy Tenants", value: "5,000+" }].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-bold" style={{ color: "hsl(0 0% 100%)" }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: "hsl(220 10% 65%)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose ToLetHub?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A smarter way to find and list rental properties with modern features built for reliability.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-primary" /></div>
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Featured Properties</h2>
                <p className="text-muted-foreground">Hand-picked homes available right now</p>
              </div>
              <Link to="/listings"><Button variant="ghost" className="gap-2 text-primary">View All <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((house, i) => (
                <HouseCard key={house.id} house={house} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: "hsl(0 0% 100%)" }}>Ready to Find Your Home?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "hsl(220 10% 75%)" }}>Join thousands of tenants who found their perfect rental through ToLetHub.</p>
            <div className="flex justify-center gap-3">
              <Link to="/auth?mode=signup"><Button size="lg" className="text-base px-8">Create Free Account</Button></Link>
              <Link to="/listings"><Button size="lg" variant="outline" className="text-base px-8 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">Browse Listings</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-display font-bold text-foreground">ToLet<span className="text-primary">Hub</span></span>
            <p className="text-muted-foreground text-sm">© 2026 ToLetHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
