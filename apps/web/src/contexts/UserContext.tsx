import { createSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContentType = {
  getUser: () => Promise<User | undefined>;
  user: User | undefined;
  loading: boolean;
};

const UserContext = createContext<UserContentType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user || typeof window === "undefined") return;

    // Check if we're coming from UIP Control
    const referrer = document.referrer;
    const comingFromUipControl = referrer && referrer.includes("uipcontrol.com");
    
    getUser().then((currentUser) => {
      // If no user found and not in development, handle redirect
      if (!currentUser && !window.location.hostname.includes("localhost")) {
        // Wait a moment for any async auth to complete
        setTimeout(() => {
          if (!user) {
            // If still no user after timeout, redirect to UIP Control
            if (comingFromUipControl) {
              // User came from UIP Control but isn't authenticated
              // This might be a session issue, redirect back with a message
              window.location.href = "https://uipcontrol.com?error=canvas_auth_failed";
            } else {
              // Direct visit without authentication
              window.location.href = "https://uipcontrol.com";
            }
          }
        }, 2000); // Give 2 seconds for auth to establish
      }
    });
  }, [user]);

  async function getUser() {
    if (user) {
      setLoading(false);
      return user;
    }

    const supabase = createSupabaseClient();

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    setUser(supabaseUser || undefined);
    setLoading(false);
    return supabaseUser || undefined;
  }

  const contextValue: UserContentType = {
    getUser,
    user,
    loading,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
