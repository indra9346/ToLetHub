const ipRequests = new Map();
const LIMIT = 20; // Max 20 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

const chatRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }

  const timestamps = ipRequests.get(ip);
  
  // Filter timestamps to keep only those within the sliding 1-minute window
  const recentRequests = timestamps.filter(time => now - time < WINDOW_MS);
  
  if (recentRequests.length >= LIMIT) {
    return res.status(429).json({
      success: false,
      message: 'Too many chat queries. Please wait 1 minute before asking again.'
    });
  }

  recentRequests.push(now);
  ipRequests.set(ip, recentRequests);
  
  next();
};

module.exports = chatRateLimiter;
