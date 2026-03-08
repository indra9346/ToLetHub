import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Heart, User, Menu, X, MapPin, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/listings", label: "Browse", icon: Search },
  { path: "/map", label: "Map View", icon: MapPin },
  { path: "/favorites", label: "Favorites", icon: Heart },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              ToLet<span className="text-primary">Hub</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className={isActive ? "" : "text-muted-foreground hover:text-foreground"}>
                    <item.icon className="w-4 h-4 mr-1.5" />{item.label}
                  </Button>
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin">
                <Button variant={location.pathname === "/admin" ? "default" : "ghost"} size="sm" className={location.pathname === "/admin" ? "" : "text-muted-foreground hover:text-foreground"}>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />Dashboard
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <User className="w-4 h-4" />
                    {user.user_metadata?.full_name?.split(" ")[0] || "Profile"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth"><Button variant="outline" size="sm"><LogIn className="w-4 h-4 mr-1.5" />Sign In</Button></Link>
                <Link to="/auth?mode=signup"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-16 left-0 right-0 z-40 glass border-b border-border/50 md:hidden">
            <div className="p-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                      <item.icon className="w-4 h-4 mr-2" />{item.label}
                    </Button>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <Button variant={location.pathname === "/admin" ? "default" : "ghost"} className="w-full justify-start">
                    <LayoutDashboard className="w-4 h-4 mr-2" />Dashboard
                  </Button>
                </Link>
              )}
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <div className="flex gap-2">
                    <Link to="/profile" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Profile</Button>
                    </Link>
                    <Button variant="outline" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/auth" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth?mode=signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link to={user ? "/profile" : "/auth"} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${["/auth", "/profile"].includes(location.pathname) ? "text-primary" : "text-muted-foreground"}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">{user ? "Profile" : "Account"}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
