import { Session, User } from "@supabase/supabase-js";
import { createClient } from "./server";

export async function verifyUserAuthenticated(): Promise<
  { user: User; session: Session } | undefined
> {
  const supabase = createClient();
  
  // Use getUser() for secure authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return undefined;
  }
  
  // Only get session after we've verified the user is authentic
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Verify the session belongs to the authenticated user
  if (!session || session.user.id !== user.id) {
    return undefined;
  }
  
  return { user, session };
}
