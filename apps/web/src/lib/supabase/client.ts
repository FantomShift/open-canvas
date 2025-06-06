import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => {
          // Get cookie normally
          if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
          }
          return null;
        },
        set: (name, value, options) => {
          // Set cookie with domain that allows sharing across uipcontrol.com subdomains
          if (typeof document !== 'undefined') {
            const isProduction = window.location.hostname.includes('uipcontrol.com');
            const cookieOptions = {
              ...options,
              // In production, set domain to share across uipcontrol.com subdomains
              domain: isProduction ? '.uipcontrol.com' : undefined,
              sameSite: 'lax' as const,
              secure: isProduction, // Only secure in production
            };
            
            let cookieString = `${name}=${value}`;
            if (cookieOptions.maxAge) cookieString += `; Max-Age=${cookieOptions.maxAge}`;
            if (cookieOptions.domain) cookieString += `; Domain=${cookieOptions.domain}`;
            if (cookieOptions.path) cookieString += `; Path=${cookieOptions.path}`;
            if (cookieOptions.sameSite) cookieString += `; SameSite=${cookieOptions.sameSite}`;
            if (cookieOptions.secure) cookieString += `; Secure`;
            if (cookieOptions.httpOnly) cookieString += `; HttpOnly`;
            
            document.cookie = cookieString;
          }
        },
        remove: (name, options) => {
          // Remove cookie with same domain configuration
          if (typeof document !== 'undefined') {
            const isProduction = window.location.hostname.includes('uipcontrol.com');
            const cookieOptions = {
              ...options,
              domain: isProduction ? '.uipcontrol.com' : undefined,
            };
            
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            if (cookieOptions.domain) cookieString += `; Domain=${cookieOptions.domain}`;
            if (cookieOptions.path) cookieString += `; Path=${cookieOptions.path}`;
            
            document.cookie = cookieString;
          }
        },
      },
    }
  );
}
