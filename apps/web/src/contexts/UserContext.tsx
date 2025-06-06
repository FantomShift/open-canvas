import { createSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
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

  const getUser = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user || typeof window === "undefined") return;
    getUser();
  }, [user, getUser]);

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
