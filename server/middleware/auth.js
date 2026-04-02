
import jwt from 'jsonwebtoken';

// Extend Express Request to include user












/**
 * Real JWT Authentication Middleware
 * NO MOCK FALLBACKS ALLOWED.
 */
export function requireAuth(req, res, next) {
  console.log(`[AUTH] requireAuth executing for path: ${req.path}`);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH] Missing or invalid Authorization header for path: ${req.path}`);
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AUTH] JWT_SECRET is not defined in environment variables!');
      throw new Error('Internal authentication configuration error');
    }

    const decoded = jwt.verify(
      token,
      secret
    );





    console.log(`[AUTH] Token verified successfully for user ID: ${decoded.id}, Role: ${decoded.role}`);

    // Attach real decoded user
    req.user = decoded;
    next();

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH] Token verification failed: ${message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

/**
 * Role-based authorization
 */
export function requirePermission(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      console.warn(`[AUTH] requirePermission failed: No user attached to request`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== requiredRole) {
      console.warn(`[AUTH] Access denied for user ${req.user.id}. Required: ${requiredRole}, Found: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    next();
  };
}

/**
 * Role-based authorization (Array-based)
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!allowedRoles.includes(req.user.role.toUpperCase())) {
      console.warn(`[AUTH] Access denied. User role '${req.user.role}' not in allowed list: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
}

/**
 * Optional auth middleware
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET;

      const decoded = jwt.verify(
        token,
        secret
      );





      req.user = decoded;
    } catch {

      // Ignore errors in optional mode
    }}

  next();
}