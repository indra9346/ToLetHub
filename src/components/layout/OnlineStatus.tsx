import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className={`fixed top-16 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 text-sm font-medium ${
            isOnline
              ? "bg-success text-success-foreground"
              : "bg-warning text-warning-foreground"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              Online — Live Data
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Offline — Showing Cached Data
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnlineStatus;
