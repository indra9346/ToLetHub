import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Shield, LogOut, Settings, Heart, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Profile</h1>

          <div className="bg-card rounded-xl p-6 card-shadow mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold text-lg text-card-foreground">
                  {user.user_metadata?.full_name || "User"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                {isAdmin && (
                  <Badge className="mt-1 gap-1 bg-primary text-primary-foreground">
                    <Shield className="w-3 h-3" /> Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isAdmin ? (
              <Link to="/admin" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Settings className="w-4 h-4" /> Owner Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/favorites" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Heart className="w-4 h-4" /> Saved Properties
                  </Button>
                </Link>
                <Link to="/listings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Home className="w-4 h-4" /> Browse Listings
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
