/**
 * JWT Token Utility Functions
 */

interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Parse JWT token without verification (for client-side use)
 * Note: This is safe for extracting basic info like role, but not for security-sensitive operations
 */
export function parseJWTToken(token: string): JWTPayload | null {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 decode and parse
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);

    return parsed;
  } catch (error) {
    return null;
  }
}

/**
 * Extract user role from JWT token
 */
export function getUserRoleFromToken(token: string): string | null {
  const payload = parseJWTToken(token);
  return payload?.role || null;
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = parseJWTToken(token);
  return payload?.sub || null;
}

/**
 * Extract user name from JWT token
 */
export function getUserNameFromToken(token: string): string | null {
  const payload = parseJWTToken(token);
  if (!payload) return null;
  return payload.name || (payload as any).fullName || (payload as any).firstName || (payload as any).username || null;
}

/**
 * Extract user email from JWT token
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = parseJWTToken(token);
  return payload?.email || null;
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role: string): string {
  switch (role.toLowerCase()) {
    case 'employee':
      return '/dashboard/employee';
    case 'manager':
      return '/dashboard/manager';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard/employee'; // fallback
  }
}
