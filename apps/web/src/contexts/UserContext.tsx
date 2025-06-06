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
      // If no user found and not in development
      if (!currentUser && !window.location.hostname.includes("localhost")) {
        // Only redirect if user has been loading for a while and still no auth
        // This gives more time for cross-domain authentication to work
        if (!comingFromUipControl) {
          // Direct visit without authentication - redirect immediately
          window.location.href = "https://uipcontrol.com";
        }
        // If coming from UIP Control, don't redirect automatically
        // Let the user interact with the page or show an error
      }
    });
  }, [user]);

  async function getUser() {
    if (user) {
      setLoading(false);
      return user;
    }

    const supabase = createSupabaseClient();

    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      
      setUser(supabaseUser || undefined);
      setLoading(false);
      return supabaseUser || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      setUser(undefined);
      setLoading(false);
      return undefined;
    }
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
