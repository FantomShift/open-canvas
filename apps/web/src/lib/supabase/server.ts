import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Configure cookies to be shared across uipcontrol.com subdomains in production
              const isProduction = process.env.NODE_ENV === 'production';
              const enhancedOptions = {
                ...options,
                domain: isProduction ? '.uipcontrol.com' : undefined,
                sameSite: 'lax' as const,
                secure: isProduction,
              };
              cookieStore.set(name, value, enhancedOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
