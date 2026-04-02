import rateLimit from "express-rate-limit";

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication Brute-Force Limiter
 * 5 login attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only limit failed attempts if possible (though express-rate-limit 6.x handles this differently)
});

/**
 * AI & ML Service Rate Limiter
 * 20 requests per minute per IP
 * Protects expensive question generation and ML mapping
 */
export const heavyServiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests to heavy services. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
