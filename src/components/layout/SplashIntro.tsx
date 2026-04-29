import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";

const SESSION_KEY = "tolethub_splash_shown";

const Star = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, boxShadow: `0 0 ${size * 3}px hsl(12 80% 60%)` }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
  />
);

const SplashIntro = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(t);
  }, [show]);

  // Pre-generated star positions
  const stars = Array.from({ length: 40 }, (_, i) => ({
    delay: 0.2 + (i % 20) * 0.04,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center hero-gradient overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Stars */}
          <div className="absolute inset-0">
            {stars.map((s, i) => (
              <Star key={i} {...s} />
            ))}
          </div>

          {/* Converging beams */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <motion.div
              key={angle}
              className="absolute left-1/2 top-1/2 h-[2px] origin-left"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(12 80% 60%), transparent)",
                rotate: `${angle}deg`,
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: ["0vw", "60vw", "0vw"], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
            />
          ))}

          {/* Center logo */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ duration: 1.1, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl"
              style={{ boxShadow: "0 0 80px hsl(12 80% 55% / 0.7)" }}
            >
              <Home className="w-12 h-12 text-white" strokeWidth={2.5} />
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-primary"
                animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                transition={{ duration: 1.2, delay: 1.2, repeat: 1 }}
              />
            </motion.div>

            <motion.h1
              className="font-display text-5xl sm:text-6xl font-bold mt-6 tracking-tight"
              initial={{ opacity: 0, y: 20, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
              transition={{ duration: 0.9, delay: 1.0, ease: "easeOut" }}
              style={{ color: "hsl(0 0% 100%)" }}
            >
              ToLet<span className="text-gradient">Hub</span>
            </motion.h1>

            <motion.div
              className="mt-4 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 240 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            />

            <motion.p
              className="text-sm mt-3 tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              style={{ color: "hsl(220 10% 75%)" }}
            >
              Find Your Home
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;