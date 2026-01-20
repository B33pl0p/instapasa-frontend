/**
 * Decode JWT token to extract payload
 * Note: This only decodes, doesn't verify the signature
 */
export function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get customer info from JWT token stored in localStorage
 */
export function getCustomerFromToken(): { business_name?: string; email?: string; instagram_username?: string } | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    business_name: decoded.business_name,
    email: decoded.email,
    instagram_username: decoded.instagram_username,
  };
}
